
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to <span className="text-orange-500">Toolify</span>
          </h1>
          <p className="text-gray-400">
            Sign in to access AI-powered tool recognition
          </p>
        </div>

        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-gray-800 shadow-2xl border border-gray-700",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton:
                "bg-gray-700 border-gray-600 text-white hover:bg-gray-600",
              socialButtonsBlockButtonText: "text-white font-medium",
              formButtonPrimary: "bg-orange-500 hover:bg-orange-600 text-white",
              footerActionLink: "text-orange-500 hover:text-orange-400",
              formFieldLabel: "text-gray-300",
              formFieldInput: "bg-gray-700 border-gray-600 text-white",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-orange-500",
              formFieldInputShowPasswordButton: "text-gray-400",
              otpCodeFieldInput: "bg-gray-700 border-gray-600 text-white",
              dividerLine: "bg-gray-600",
              dividerText: "text-gray-400",
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          forceRedirectUrl="/chat"
        />
      </div>
    </div>
  );
}
