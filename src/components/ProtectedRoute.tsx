import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../components/hooks/useAuth";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth();

  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Checking authentication...</p>
      </div>
    );
  }


  if (!user) {
    return <Navigate to="/hr-login" replace />;
  }

  return children;
}
