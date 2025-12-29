
# StreaX Cloud Console Simulator

This project is a high-fidelity replica of a cloud management console (inspired by AWS) branded as **StreaX**. It is built using React, Tailwind CSS, and Google Gemini AI for the intelligent assistant.

## 🚀 How to Run Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Setup API Key**:
   Obtain a Google Gemini API Key from [AI Studio](https://aistudio.google.com/) and set it as an environment variable `API_KEY`.
3. **Start Development Server**:
   ```bash
   npm run dev
   ```
4. **Open Browser**:
   Navigate to `http://localhost:5173`.

## 🌐 How to Deploy Online (Vercel/Netlify)

1. Push this code to a **GitHub** repository.
2. Connect your repository to **Vercel** or **Netlify**.
3. Add an Environment Variable:
   - Key: `API_KEY`
   - Value: `your_gemini_api_key_here`
4. Deploy! Your site will be live on a public URL.

## 🛠 Features
- **IAM Identity Center**: Advanced signup system with Admin/User roles and "Confirm Password" validation.
- **Root Admin Mode**: Red-themed high-privilege UI for managing the global identity registry.
- **Service Simulation**: EC2, S3, RDS, VPC, and Lambda interfaces with realistic interactions.
- **Cloud Q Assistant**: AI-powered chat assistant using Gemini 1.5 Flash.
- **PWA Ready**: Can be installed on mobile devices.

## 📂 Project Structure
- `index.tsx`: Entry point.
- `App.tsx`: Main routing and state management.
- `components/`: Modular UI components for each cloud service.
- `services/`: Backend simulations (AI integration).
- `types.ts`: Global type definitions.
