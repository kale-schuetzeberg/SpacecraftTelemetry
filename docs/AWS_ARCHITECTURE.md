# AWS Production Architecture

## Document Information

| Field | Value |
|-------|-------|
| Project | Spacecraft Telemetry Ground Station |
| Version | 1.0 |
| Author | Kale Schuetzeberg |
| Last Updated | 2026-02-01 |
| Status | Draft |

---

## 1. Executive Summary

This document outlines the AWS production architecture for the Spacecraft Telemetry Ground Station application. The architecture is designed to demonstrate proficiency in modern cloud infrastructure including containerization, Kubernetes orchestration, and AWS services while maintaining production-grade reliability and security.

### Key Objectives

- Deploy a real-time WebSocket-based telemetry streaming application
- Demonstrate hands-on experience with Docker, Kubernetes, and core AWS services
- Implement infrastructure as code using Terraform
- Establish CI/CD pipeline for automated deployments
- Enable monitoring, observability, and secure design practices

---

## 2. Architecture Overview

### 2.1 High-Level Architecture Diagram

```
                                    ┌─────────────────────────────────────────┐
                                    │              INTERNET                   │
                                    └─────────────────────┬───────────────────┘
                                                          │
                                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                      AWS CLOUD                                          │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │                               Route 53 (DNS)                                      │  │
│  │                        spacecraft-telemetry.yourdomain.com                        │  │
│  └───────────────────────────────────────┬───────────────────────────────────────────┘  │
│                                          │                                              │
│                    ┌─────────────────────┴─────────────────────┐                        │
│                    │                                           │                        │
│                    ▼                                           ▼                        │
│  ┌─────────────────────────────────┐         ┌─────────────────────────────────────┐    │
│  │     CloudFront Distribution     │         │    Application Load Balancer        │    │
│  │     (CDN + ACM Certificate)     │         │    (ACM Certificate for HTTPS)      │    │
│  │                                 │         │                                     │    │
│  │  Origin: S3 (static assets)     │         │  Target: EKS Service (port 8000)    │    │
│  │  Path: /*                       │         │  Path: /api/*, /ws/*                │    │
│  └───────────────┬─────────────────┘         └──────────────────┬──────────────────┘    │
│                  │                                              │                       │
│                  ▼                                              │                       │
│  ┌─────────────────────────────────┐                            │                       │
│  │         S3 Bucket               │                            │                       │
│  │    (React Production Build)     │                            │                       │
│  │                                 │                            │                       │
│  │  - index.html                   │                            │                       │
│  │  - static/js/*.js               │                            │                       │
│  │  - static/css/*.css             │                            │                       │
│  └─────────────────────────────────┘                            │                       │
│                                                                 │                       │
│  ┌──────────────────────────────────────────────────────────────┴────────────────────┐  │
│  │                                    VPC                                            │  │
│  │                              (10.0.0.0/16)                                        │  │
│  │                                                                                   │  │
│  │   ┌─────────────────────────────────────────────────────────────────────────┐     │  │
│  │   │                    Public Subnets (10.0.1.0/24, 10.0.2.0/24)            │     │  │
│  │   │                                                                         │     │  │
│  │   │    ┌──────────────┐    ┌──────────────┐                                 │     │  │
│  │   │    │  NAT Gateway │    │  NAT Gateway │   (High Availability)           │     │  │
│  │   │    │    (AZ-a)    │    │    (AZ-b)    │                                 │     │  │
│  │   │    └──────────────┘    └──────────────┘                                 │     │  │
│  │   └─────────────────────────────────────────────────────────────────────────┘     │  │
│  │                                                                                   │  │
│  │   ┌─────────────────────────────────────────────────────────────────────────┐     │  │
│  │   │                   Private Subnets (10.0.10.0/24, 10.0.11.0/24)          │     │  │
│  │   │                                                                         │     │  │
│  │   │   ┌──────────────────────────────────────────────────────────────────┐  │     │  │
│  │   │   │                      EKS CLUSTER                                 │  │     │  │
│  │   │   │                                                                  │  │     │  │
│  │   │   │  ┌─────────────────────────────────────────────────────────────┐ │  │     │  │
│  │   │   │  │              EC2 Worker Node Group                          │ │  │     │  │
│  │   │   │  │              (t3.medium, 2-4 nodes)                         │ │  │     │  │
│  │   │   │  │                                                             │ │  │     │  │
│  │   │   │  │   ┌─────────────────┐      ┌─────────────────┐              │ │  │     │  │
│  │   │   │  │   │  Backend Pod    │      │  Backend Pod    │              │ │  │     │  │
│  │   │   │  │   │  ┌───────────┐  │      │  ┌───────────┐  │              │ │  │     │  │
│  │   │   │  │   │  │  FastAPI  │  │      │  │  FastAPI  │  │              │ │  │     │  │
│  │   │   │  │   │  │  + Uvicorn│  │      │  │  + Uvicorn│  │              │ │  │     │  │
│  │   │   │  │   │  │  :8000    │  │      │  │  :8000    │  │              │ │  │     │  │
│  │   │   │  │   │  └───────────┘  │      │  └───────────┘  │              │ │  │     │  │
│  │   │   │  │   └─────────────────┘      └─────────────────┘              │ │  │     │  │
│  │   │   │  │                                                             │ │  │     │  │
│  │   │   │  └─────────────────────────────────────────────────────────────┘ │  │     │  │
│  │   │   │                                                                  │  │     │  │
│  │   │   │  Kubernetes Resources:                                           │  │     │  │
│  │   │   │  - Deployment (backend, 2 replicas)                              │  │     │  │
│  │   │   │  - Service (ClusterIP)                                           │  │     │  │
│  │   │   │  - Ingress (ALB Ingress Controller)                              │  │     │  │
│  │   │   │  - HorizontalPodAutoscaler                                       │  │     │  │
│  │   │   │  - ConfigMap, Secrets                                            │  │     │  │
│  │   │   └──────────────────────────────────────────────────────────────────┘  │     │  │
│  │   │                                                                         │     │  │
│  │   └─────────────────────────────────────────────────────────────────────────┘     │  │
│  │                                                                                   │  │
│  │   ┌─────────────────────────────────────────────────────────────────────────┐     │  │
│  │   │                   Database Subnets (10.0.20.0/24, 10.0.21.0/24)         │     │  │
│  │   │                              (Phase 3)                                  │     │  │
│  │   │   ┌───────────────────────────────────────────────────────────────┐     │     │  │
│  │   │   │                    RDS PostgreSQL                             │     │     │  │
│  │   │   │                  (Multi-AZ, db.t3.micro)                      │     │     │  │
│  │   │   └───────────────────────────────────────────────────────────────┘     │     │  │
│  │   └─────────────────────────────────────────────────────────────────────────┘     │  │
│  │                                                                                   │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                         │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐   │
│  │                              Supporting Services                                 │   │
│  │                                                                                  │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                   │   │
│  │  │       ECR       │  │   CloudWatch    │  │     Lambda      │                   │   │
│  │  │  (Container     │  │   (Logs &       │  │   (Health       │                   │   │
│  │  │   Registry)     │  │    Metrics)     │  │    Checks)      │                   │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘                   │   │
│  │                                                                                  │   │
│  └──────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              REQUEST FLOW                                            │
└──────────────────────────────────────────────────────────────────────────────────────┘

STATIC ASSETS (React App):
┌────────┐     ┌─────────┐     ┌────────────┐     ┌────────┐
│ Browser│────▶│ Route53 │────▶│ CloudFront │────▶│   S3   │
│        │◀────│         │◀────│  (cached)  │◀────│        │
└────────┘     └─────────┘     └────────────┘     └────────┘
                                    │
                              Cache HIT: ~10ms
                              Cache MISS: ~50ms


WEBSOCKET TELEMETRY STREAM:
┌────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────────┐
│ Browser│────▶│ Route53 │────▶│   ALB   │────▶│   EKS   │────▶│  FastAPI    │
│   JS   │◀────│         │◀────│ (wss://)│◀────│ Service │◀────│  WebSocket  │
└────────┘     └─────────┘     └─────────┘     └─────────┘     └─────────────┘
    │                                                                 │
    │                        Persistent Connection                    │
    │◀────────────────────── Telemetry @ 1Hz ─────────────────────────│


API REQUESTS (Future):
┌────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────────┐
│ Browser│────▶│ Route53 │────▶│   ALB   │────▶│   EKS   │────▶│  FastAPI    │
│        │◀────│         │◀────│ (HTTPS) │◀────│ Service │◀────│  REST API   │
└────────┘     └─────────┘     └─────────┘     └─────────┘     └─────────────┘
                                                                      │
                                                                      ▼
                                                               ┌─────────────┐
                                                               │     RDS     │
                                                               │ (Phase 3)   │
                                                               └─────────────┘
```

---

## 3. Component Specifications

### 3.1 Compute

| Component | Specification | Purpose |
|-----------|--------------|---------|
| EKS Cluster | Kubernetes 1.29 | Container orchestration |
| EC2 Worker Nodes | t3.medium (2 vCPU, 4GB RAM) | Run Kubernetes pods |
| Node Group | Min: 2, Max: 4, Desired: 2 | Auto-scaling capacity |
| Backend Pods | 2 replicas (HPA: 2-6) | FastAPI application |

### 3.2 Networking

| Component | Specification | Purpose |
|-----------|--------------|---------|
| VPC | 10.0.0.0/16 | Isolated network |
| Public Subnets | 10.0.1.0/24, 10.0.2.0/24 | NAT Gateways, ALB |
| Private Subnets | 10.0.10.0/24, 10.0.11.0/24 | EKS worker nodes |
| Database Subnets | 10.0.20.0/24, 10.0.21.0/24 | RDS (Phase 3) |
| ALB | Application Load Balancer | HTTPS/WSS termination |
| NAT Gateway | 2x (HA across AZs) | Outbound internet for private subnets |

### 3.3 Storage & Database

| Component | Specification | Purpose |
|-----------|--------------|---------|
| S3 Bucket | Standard, versioned | React static assets |
| ECR | Private repository | Docker image storage |
| RDS PostgreSQL | db.t3.micro, Multi-AZ (Phase 3) | Telemetry persistence |

### 3.4 Security

| Component | Specification | Purpose |
|-----------|--------------|---------|
| ACM Certificates | Managed SSL/TLS | HTTPS encryption |
| Security Groups | Least-privilege rules | Network access control |
| IAM Roles | IRSA (IAM Roles for Service Accounts) | Pod-level permissions |
| Secrets Manager | Encrypted secrets | Database credentials |

### 3.5 Monitoring & Observability

| Component | Specification | Purpose |
|-----------|--------------|---------|
| CloudWatch Logs | Container logs, ALB logs | Centralized logging |
| CloudWatch Metrics | CPU, Memory, Network | Infrastructure metrics |
| CloudWatch Alarms | Threshold-based alerts | Incident notification |
| Container Insights | EKS monitoring | Kubernetes metrics |

---

## 4. Security Architecture

### 4.1 Network Security

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SECURITY LAYERS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  LAYER 1: Edge Security                                                     │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  • CloudFront with AWS Shield (DDoS protection)                        │ │
│  │  • ACM certificates (TLS 1.2+)                                         │ │
│  │  • WAF rules (optional, for API protection)                            │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  LAYER 2: Network Security                                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  • VPC isolation (no direct internet access to workers)                │ │
│  │  • Security Groups (stateful firewall)                                 │ │
│  │  • NACLs (stateless subnet-level filtering)                            │ │
│  │  • Private subnets for all workloads                                   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  LAYER 3: Application Security                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  • Kubernetes Network Policies                                         │ │
│  │  • Pod Security Standards (restricted)                                 │ │
│  │  • Non-root container execution                                        │ │
│  │  • Read-only root filesystem                                           │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  LAYER 4: Data Security                                                     │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  • Encryption at rest (S3, RDS, EBS)                                   │ │
│  │  • Encryption in transit (TLS everywhere)                              │ │
│  │  • Secrets Manager for credentials                                     │ │
│  │  • IAM least-privilege access                                          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Security Groups

| Security Group | Inbound Rules | Outbound Rules |
|----------------|---------------|----------------|
| ALB-SG | 443 from 0.0.0.0/0 | All to EKS-SG |
| EKS-SG | 8000 from ALB-SG, All from EKS-SG | All to 0.0.0.0/0 |
| RDS-SG | 5432 from EKS-SG | None |

---

## 5. CI/CD Pipeline

### 5.1 Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            CI/CD PIPELINE (GitHub Actions)                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ┌─────────┐     ┌─────────────────────────────────────────────────────────┐   │
│   │  Push   │     │                    CI STAGE                             │   │
│   │  to     │────▶│                                                         │   │
│   │  main   │     │  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐  │   │
│   └─────────┘     │  │  Lint   │──▶│  Test   │──▶│  Build  │──▶│  Scan   │  │   │
│                   │  │         │   │         │   │ Docker  │   │ (Trivy) │  │   │
│                   │  └─────────┘   └─────────┘   └─────────┘   └─────────┘  │   │
│                   └──────────────────────────────────────┬──────────────────┘   │
│                                                          │                      │
│                                                          ▼                      │
│                   ┌─────────────────────────────────────────────────────────┐   │
│                   │                    CD STAGE                             │   │
│                   │                                                         │   │
│                   │  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐  │   │
│                   │  │  Push   │──▶│ Deploy  │──▶│ Health  │──▶│ Notify  │  │   │
│                   │  │ to ECR  │   │ to EKS  │   │  Check  │   │ (GitHub)│  │   │
│                   │  └─────────┘   └─────────┘   └─────────┘   └─────────┘  │   │
│                   └─────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Pipeline Stages

| Stage | Tools | Purpose |
|-------|-------|---------|
| Lint | ESLint, Ruff, Prettier | Code quality |
| Test | Pytest, Vitest | Unit & integration tests |
| Build | Docker, npm | Create artifacts |
| Scan | Trivy | Security vulnerability scanning |
| Push | AWS ECR | Store container images |
| Deploy | kubectl, Helm | Update Kubernetes resources |
| Health Check | curl, kubectl | Verify deployment |

---

## 6. Implementation Phases

### Phase 2A: Containerization

```
├── Backend Dockerfile
│   ├── Multi-stage build (builder + runtime)
│   ├── Non-root user
│   └── Health check endpoint
├── Frontend Dockerfile (for local dev)
│   └── nginx-based production build
├── docker-compose.yml
│   ├── Backend service
│   ├── Frontend service (dev)
│   └── Shared network
└── Local testing & validation
```

**Deliverables:**
- [x] `backend/Dockerfile`
- [x] `frontend/Dockerfile`
- [x] `docker-compose.yml`
- [x] `.dockerignore` files

### Phase 2B: Kubernetes Manifests

```
├── Kubernetes manifests (k8s/)
│   ├── namespace.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   ├── hpa.yaml
│   └── network-policy.yaml
└── Local testing with kubectl though docker desktop
```

**Deliverables:**
- [x] `k8s/` directory with all manifests
- [x] Working Local Kubernetes

### Phase 2C: Terraform Infrastructure

```
├── terraform/
│   ├── environments/
│   │   ├── dev/
│   │   └── prod/
│   ├── modules/
│   │   ├── vpc/
│   │   ├── eks/
│   │   ├── ecr/
│   │   ├── s3-cloudfront/
│   │   ├── alb/
│   │   └── iam/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── backend.tf (S3 state)
├── Implment Helm Charts
└── Documentation
```

**Deliverables:**
- [ ] Terraform modules for each component
- [ ] Environment-specific configurations
- [ ] Remote state configuration
- [ ] Terraform documentation

### Phase 2D: CI/CD Pipeline

```
├── .github/workflows/
│   ├── ci.yml (lint, test, build)
│   ├── cd.yml (deploy to EKS)
│   └── terraform.yml (IaC changes)
├── GitHub Environments
│   ├── dev
│   └── prod
└── Secrets configuration
```

**Deliverables:**
- [ ] GitHub Actions workflows
- [ ] Environment protection rules
- [ ] Deployment documentation

### Phase 2E: Monitoring & Observability

```
├── CloudWatch configuration
│   ├── Log groups
│   ├── Metrics
│   └── Alarms
├── Container Insights
├── Application metrics endpoint (/metrics)
└── Grafana dashboards (optional)
```

**Deliverables:**
- [ ] CloudWatch dashboards
- [ ] Alert configuration
- [ ] Runbook documentation

---

## 7. Cost Estimation

### 7.1 Monthly Cost Breakdown (Estimated)

| Service | Specification | Est. Monthly Cost |
|---------|--------------|-------------------|
| EKS Cluster | Control plane | $72 |
| EC2 (EKS Nodes) | 2x t3.medium | $60 |
| NAT Gateway | 2x (HA) | $65 |
| ALB | Application LB | $22 |
| S3 | < 1GB static | $1 |
| CloudFront | < 100GB transfer | $10 |
| ECR | < 10GB images | $1 |
| CloudWatch | Logs & metrics | $15 |
| Route53 | Hosted zone + queries | $1 |
| **Total** | | **~$247/month** |

### 7.2 Cost Optimization Options

| Option | Savings | Trade-off |
|--------|---------|-----------|
| Single NAT Gateway | ~$32/month | Reduced HA |
| Spot Instances for nodes | ~30-60% on EC2 | Possible interruptions |
| Reserved Instances (1yr) | ~30% on EC2 | Commitment |
| Smaller node type (t3.small) | ~$20/month | Less headroom |

**Development/Demo Configuration:** ~$150/month (single NAT, spot instances)

---

## 8. Disaster Recovery & High Availability

### 8.1 Availability Design

| Component | HA Strategy | RPO | RTO |
|-----------|-------------|-----|-----|
| EKS Control Plane | AWS-managed, Multi-AZ | N/A | N/A |
| Worker Nodes | Multi-AZ node group | 0 | < 5 min |
| ALB | Multi-AZ by default | N/A | N/A |
| S3 | 99.999999999% durability | 0 | 0 |
| RDS (Phase 3) | Multi-AZ standby | < 5 min | < 5 min |

### 8.2 Backup Strategy

| Resource | Backup Method | Retention |
|----------|---------------|-----------|
| S3 Objects | Versioning enabled | 30 days |
| RDS | Automated snapshots | 7 days |
| EKS Config | GitOps (manifests in repo) | Indefinite |
| Terraform State | S3 versioning | 30 days |

---

## 9. Technology Stack Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TECHNOLOGY STACK                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  APPLICATION                                                                │
│  ├── Frontend: React 18, TypeScript, Vite, Recharts                         │
│  └── Backend: Python 3.11, FastAPI, Uvicorn, Pydantic, WebSockets           │
│                                                                             │
│  CONTAINERIZATION                                                           │
│  ├── Runtime: Docker                                                        │
│  ├── Registry: AWS ECR                                                      │
│  └── Orchestration: Kubernetes (AWS EKS)                                    │
│                                                                             │
│  AWS SERVICES                                                               │
│  ├── Compute: EKS, EC2                                                      │
│  ├── Networking: VPC, ALB, Route53, CloudFront                              │
│  ├── Storage: S3, ECR                                                       │
│  ├── Database: RDS PostgreSQL (Phase 3)                                     │
│  ├── Security: ACM, IAM, Secrets Manager, Security Groups                   │
│  └── Monitoring: CloudWatch, Container Insights                             │
│                                                                             │
│  INFRASTRUCTURE AS CODE                                                     │
│  └── Terraform                                                              │
│                                                                             │
│  CI/CD                                                                      │
│  └── GitHub Actions                                                         │
│                                                                             │
│  SECURITY SCANNING                                                          │
│  └── Trivy (container vulnerability scanning)                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Repository Structure (Target)

```
SpacecraftTelemetry/
├── backend/
│   ├── app/
│   ├── tests/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .dockerignore
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
├── k8s/
│   ├── base/
│   │   ├── namespace.yaml
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── ingress.yaml
│   │   ├── configmap.yaml
│   │   └── hpa.yaml
│   └── overlays/
│       ├── dev/
│       └── prod/
├── terraform/
│   ├── modules/
│   │   ├── vpc/
│   │   ├── eks/
│   │   ├── ecr/
│   │   ├── s3-cloudfront/
│   │   └── iam/
│   ├── environments/
│   │   ├── dev/
│   │   └── prod/
│   └── backend.tf
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── cd.yml
│       └── terraform.yml
├── docs/
│   └── AWS_ARCHITECTURE.md
├── docker-compose.yml
└── README.md
```

---

## 11. Decision Log

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| Container Orchestration | ECS Fargate, EKS, Raw EC2 | EKS with EC2 nodes | Demonstrates both Kubernetes and EC2 experience |
| Frontend Hosting | Containerized, S3+CloudFront | S3+CloudFront | Cost-effective, faster, industry standard for SPAs |
| Load Balancer | ALB, NLB, API Gateway | ALB | Native WebSocket support, integrates with EKS |
| SSL Certificates | Let's Encrypt, ACM | ACM | Free, auto-renewal, native AWS integration |
| CI/CD | Jenkins, GitLab CI, GitHub Actions | GitHub Actions | Already using GitHub, good AWS integration |
| IaC | CloudFormation, Terraform, Pulumi | Terraform | Industry standard, multi-cloud skills |

---

## 12. References

- [AWS EKS Best Practices Guide](https://aws.github.io/aws-eks-best-practices/)
- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| EKS | Elastic Kubernetes Service - AWS managed Kubernetes |
| ECR | Elastic Container Registry - Docker image storage |
| ALB | Application Load Balancer - Layer 7 load balancer |
| ACM | AWS Certificate Manager - SSL/TLS certificate service |
| VPC | Virtual Private Cloud - Isolated network |
| IRSA | IAM Roles for Service Accounts - Pod-level AWS permissions |
| HPA | Horizontal Pod Autoscaler - Kubernetes auto-scaling |