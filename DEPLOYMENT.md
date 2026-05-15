# Deploying to AWS

This guide outlines several ways to deploy this web application to AWS.

## Option 1: AWS App Runner (Recommended for Containers)

AWS App Runner is the easiest way to deploy a containerized web application.

1.  **Push to GitHub**: Ensure your latest code is in a GitHub repository.
2.  **Create Service**: In the AWS Console, go to App Runner and click **Create service**.
3.  **Source**: Select **Source code repository** and connect your GitHub account.
4.  **Runtime**: Select **Source code repository** and App Runner will detect the Dockerfile in the root.
5.  **Build Settings**:
    *   **Runtime**: `Docker`
6.  **Environment Variables**:
    *   Add `VITE_API_URL` if you have a custom backend URL.
7.  **Deploy**: Click **Create & Deploy**.

## Option 2: AWS Amplify (Recommended for Frontend only)

AWS Amplify is perfect for static site hosting with built-in CI/CD.

1.  **Go to AWS Amplify**: Click **Create new app** > **GitHub**.
2.  **Connect Branch**: Select your repository and branch.
3.  **Build Settings**: Amplify will automatically detect Vite. Ensure the build command is `npm run build` and the base directory is `dist`.
4.  **Environment Variables**: Add `VITE_API_URL` in the Amplify console settings under **Environment variables**.
5.  **Save and Deploy**.

## Option 3: Amazon S3 + CloudFront (Manual/Advanced)

1.  **Build Locally**: Run `npm run build`.
2.  **S3 Bucket**: Create an S3 bucket and enable **Static website hosting**.
3.  **Upload**: Upload the contents of the `dist` folder to the bucket.
4.  **CloudFront**: Create a CloudFront distribution pointing to the S3 bucket's website endpoint.
5.  **Routing**: Configure CloudFront to redirect 404s to `index.html` (for SPA routing).

## Environment Variables

The application uses the following environment variables:

*   `VITE_API_URL`: (Optional) The URL of your Amazon IVS Serverless backend. If not provided, it defaults to the demo API.

---

### Docker Support

A `Dockerfile` and `nginx.conf` have been provided in the root directory for container-based deployments.

To build locally:
```bash
docker build -t ivs-real-time-demo .
docker run -p 8080:80 ivs-real-time-demo
```
