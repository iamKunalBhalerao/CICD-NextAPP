# BKMYSW

This project is a small monorepo for a web application with multiple services:

- Web app: Next.js frontend in `apps/web`
- API server: Express backend in `apps/http-server`
- WebSocket server: real-time service in `apps/ws-server`
- Shared database package: Prisma setup in `packages/db`

The project uses a Turbo monorepo setup and pnpm workspaces.

## Project structure

```bash
.
├── apps/
│   ├── web/           # Frontend application
│   ├── http-server/   # REST API server
│   └── ws-server/     # WebSocket server
├── packages/
│   ├── db/            # Prisma database package
│   ├── ui/            # Shared UI components
│   └── ...
├── .github/
│   └── workflows/     # GitHub Actions deployment files
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## What the app does

The frontend is a Next.js app, the backend is an Express service, and the WebSocket server handles real-time communication. The database layer is shared through Prisma so all services can use the same schema and client.

This is a good example of a full-stack project where multiple apps run together but are managed from one repository.

## Local development

Install dependencies:

```bash
pnpm install
```

Run the apps together:

```bash
pnpm dev
```

Or build the project:

```bash
pnpm build
```

## CI/CD and deployment flow

The repository includes GitHub Actions workflow files in `.github/workflows`.

### 1) Deployment trigger

There are two workflow files:

- `.github/workflows/cd_staging.yml`
- `.github/workflows/cd_prod.yml`

They are triggered with:

```yaml
on:
  push:
    branches: [main]
```

and

```yaml
on:
  push:
    branches: [production]
```

This means:

- when code is pushed to `main`, deployment runs to the staging server
- when code is pushed to `production`, deployment runs to the production server

### 2) GitHub runner setup

When the workflow runs on GitHub-hosted Ubuntu, it starts a runner and executes the script inside the `steps` section.

The workflow does the following:

```yaml
- run: |
    echo "${{ secrets.SSH_PRIVATE_KEY }}" &> ~/ssh_key
    mkdir -p /home/runner/.ssh
    touch /home/runner/.ssh/known_hosts
    echo "${{ secrets.KNOWN_HOSTS }}" &> /home/runner/.ssh/known_hosts
    chmod 700 /home/runner/ssh_key
```

This sets up SSH authentication so GitHub can connect securely to the remote VPS/server.

### 3) SSH into the server

Then it connects to the server using SSH:

```bash
ssh -i ~/ssh_key ubuntu@13.127.151.223 -t "cd CICD-NextAPP/ && ..."
```

or:

```bash
ssh -i ~/ssh_key ubuntu@3.110.175.27 -t "cd CICD-NextAPP/ && ..."
```

This means the GitHub Actions runner logs into the remote machine and runs deployment commands there.

### 4) Pull latest code

Inside the remote server, the workflow does:

```bash
git pull origin main
```

or

```bash
git pull origin production
```

So the server always receives the latest version of the branch that was pushed.

### 5) Install dependencies and build

The workflow sets the PATH for Node and pnpm and then runs:

```bash
npm install -g pnpm
pnpm install
pnpm run build
```

This ensures the project dependencies are installed and the app is built before deployment.

### 6) Restart services

Finally, it restarts the application processes using PM2:

```bash
pm2 restart web
pm2 restart http-server
pm2 restart ws-server
```

This means the app is updated and the running services are restarted so the new code is served.

## Why this is CI/CD

This project follows a simple CI/CD pattern:

1. Developer pushes code to GitHub
2. GitHub Actions starts automatically
3. The workflow connects to the deployment server
4. Code is pulled from the branch
5. Dependencies are installed
6. The app is built
7. Services are restarted on the server

That is the core idea of continuous deployment: every push to a configured branch can trigger an automated deploy.

## Important GitHub secrets

The workflow depends on secrets such as:

- `SSH_PRIVATE_KEY`
- `KNOWN_HOSTS`

These must be added in the GitHub repository settings under Settings → Secrets and variables → Actions.

This is important because the workflow needs access to the SSH server without exposing private credentials in the repository.

## Best practices to improve this setup

This setup works, but it can be improved further with:

- running tests before deployment
- separate build and deploy jobs
- using environment protection rules for staging and production
- checking for lint or type errors automatically
- storing environment variables in `.env` files or secret managers

## Summary

This repository is a full-stack monorepo with a frontend, backend, and WebSocket service. The GitHub Actions workflow files automate deployment by SSH-ing into a server, pulling the latest code, installing dependencies, building the app, and restarting PM2 processes. That is a practical and common way to deploy code automatically to the internet.
