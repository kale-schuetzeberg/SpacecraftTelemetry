===============================================================================
🚀 MASTER CI/CD + BRANCH REFERENCE (All-in-One)
===============================================================================

1️⃣ Git Branch Hierarchy & Environments
--------------------------------------
        main (stable/prod)
          |
          |  PR merge (squash) from dev
          v
     prod environment
     URL: spacecraft-api.nodenavi.com
     S3 bucket: main/frontend
     K8s namespace: prod
          ^
          |
       dev branch (integration)
          |
          |  Manual deployment
          v
     dev environment
     URL: dev.spacecraft-api.nodenavi.com
     S3 bucket: dev/frontend
     K8s namespace: dev
          ^
          |
   +------+----------------------+
   |                             |
feature/login              feature/search
(branch off dev)           (branch off dev)
   |                             |
   |  Manual ephemeral deploy     |
   v                             v
feature-login environment   feature-search environment
URL: feature-login.dev...   URL: feature-search.dev...
S3 prefix: login/           S3 prefix: search/
K8s namespace: feature-login K8s namespace: feature-search

===============================================================================
2️⃣ Modular CI/CD Workflow Jobs
-------------------------------
                   +----------------------+
                   | Root Workflow ci-cd  |
                   +----------+-----------+
                              |
                              v
                     +----------------+
                     |  Setup Job      |
                     |  setup.yml      |
                     | - Sets all envs |
                     | - Outputs vars  |
                     +-------+--------+
                              |
        +---------------------+---------------------+
        |                     |                     |
        v                     v                     v
+---------------+     +---------------+     +-----------------+
| Build & Push  |     | Kubernetes    |     | DNS & Frontend  |
| build_push.yml|     | k8s_deploy.yml|     | dns_frontend.yml|
| - Docker      |     | - kubectl     |     | - Route53 UPSERT|
| - Push ECR    |     | - Wait ALB    |     | - S3 sync       |
| - Build FE    |     | - Output ALB  |     | - CloudFront    |
+-------+-------+     +-------+-------+     +--------+--------+
        |                     |                     |
        v                     v                     v
Feature / Dev / Prod deployed with correct:
- Namespace
- S3 Prefix / Bucket
- ALB / Route53 / CloudFront

===============================================================================
3️⃣ Teardown Flow (Manual)
--------------------------
                   +----------------------+
                   | Root Workflow ci-cd  |
                   | teardown=true        |
                   +----------+-----------+
                              |
                              v
                      +---------------+
                      |  Setup Job    |
                      +-------+-------+
                              |
                              v
                      +---------------+
                      | Teardown Job  |
                      | teardown.yml  |
                      +-------+-------+
                              |
      +-----------------------+-------------------------+
      |               |               |               |
      v               v               v               v
Delete K8s       Empty S3       Delete ECR       Delete Route53
Namespace        Prefix          Images           Record
                             |
                             v
                       Terraform destroy
Notes:
- Teardown deletes **resources only**, not Git branches.
- Safe for ephemeral features, dev, and prod.

===============================================================================
4️⃣ Quick Reference Table: Branch → Workflow Jobs → Deploy/Teardown Outputs
-------------------------------------------------------------------------------
+----------------+------------+--------------------+---------------------+------------------------------------------+---------------------------+
| Branch         | Env        | Workflow Jobs      | K8s Namespace       | URL                                      | S3 Bucket / Prefix        |
+----------------+------------+--------------------+---------------------+------------------------------------------+---------------------------+
| main           | prod       | setup → build_push → k8s_deploy → dns_frontend | prod                | spacecraft-api.nodenavi.com             | main/frontend            |
| dev            | dev        | setup → build_push → k8s_deploy → dns_frontend | dev                 | dev.spacecraft-api.nodenavi.com         | dev/frontend             |
| feature/login  | feature    | setup → build_push → k8s_deploy → dns_frontend | feature-login       | feature-login.dev.spacecraft-api.nodenavi.com | login/                  |
| feature/search | feature    | setup → build_push → k8s_deploy → dns_frontend | feature-search      | feature-search.dev.spacecraft-api.nodenavi.com | search/                |
+----------------+------------+--------------------+---------------------+------------------------------------------+---------------------------+

Teardown Notes:
- Trigger same workflow with `teardown=true` input.
- Deletes: K8s namespace, S3 prefix, ECR images, Route53 DNS, Terraform-managed resources.
- Safe: does **not** delete Git branches or other environments.
- Feature deployments are ephemeral; dev and prod are long-lived.
- All deployments are manual for cost control.

===============================================================================
