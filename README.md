# 🌿 Lush Leaves (Frontend Client)

A premium, production-ready Full Stack E-commerce web application designed for indoor plants built with **Next.js**, **TypeScript**, and **Tailwind CSS**.

## 🚀 Key Features

*   **Premium Interactive Hero**: Sleek responsive visual layout built with custom CSS animations and a scrolling guide.
*   **Dynamic Catalogue Grid**: Responsive product list (4 cards per row on desktop) showing high-resolution images, short descriptions, categories, specifications, and prices. Includes skeleton load screens.
*   **Interactive Details View**: Complete Care Profile detailing watering needs, sunlight levels, specifications, custom care steps, and solutions for common plant problems.
*   **Auto-Lock Shopping Cart**: Detects items in localStorage and blocks duplicate clicks on the checkout button by transforming it into an disabled `"Added to cart"` badge.
*   **Dual Authentication Systems**: Fully validated standard email registration/login + custom **Google Sign-In** button integrated through client credentials verification.
*   **Responsive Admin Panel Guard**: Protects route `/items/manage` from non-admins, displaying a clean mobile card list and a complete desktop inventory table with options to Add, Edit (prefilled fields), and Delete plants.
*   **Feedback Mechanism**: Micro-animated stackable custom Toast notification panels aligned at top-right for desktop and top-center for mobile.

---

## 🛠️ Technology Stack

*   **Framework**: Next.js 16 (App Router)
*   **Language**: TypeScript (Strongly Typed)
*   **Styles**: Tailwind CSS 4
*   **State Management & Utilities**: React Hooks, Context API (`ToastContext`), Framer Motion
*   **Social Sign-In**: `@react-oauth/google`

---

## ⚙️ Installation & Setup

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/moziful/Lush-Leaves.git
    cd Lush-Leaves
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables Setup**:
    Create a `.env.local` file in the root directory:
    ```env
    MONGODB_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret_key
    BACKEND_URL=http://localhost:5000
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
    STRIPE_SECRET_KEY=your_stripe_secret_key
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open `http://localhost:3000` on your browser to view the application.

5.  **Build for Production**:
    ```bash
    npm run build
    ```
