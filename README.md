# Dynamic Pricing Agent

An AI-powered dynamic pricing and promotion planning agent that helps optimize product pricing strategies.

## Architecture

This application is split into two parts:
- **Frontend**: Hosted on Vercel
- **Backend**: Hosted on Koyeb

## Setup Instructions

### Backend (Koyeb)

1. Make sure you have a Koyeb account
2. Set up the following environment variables in Koyeb:
   - `FIRECRAWL_API_KEY`
   - `PERPLEXITY_API_KEY`
   - `SERPER_API_KEY`
   - `FRONTEND_URL` (your Vercel deployment URL)
3. Deploy the backend directory to Koyeb

### Frontend (Vercel)

1. Update the `API_BASE_URL` in `frontend/public/index.html` to your Koyeb backend URL
2. Deploy the frontend directory to Vercel

## Local Development

1. Start the backend: