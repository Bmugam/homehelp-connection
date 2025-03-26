import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SignUp = () => {
  return (
    <div>
      <h1>Sign Up Page</h1>
      <Link to="/login">
        <Button>Go to Login</Button>
      </Link>
    </div>
  );
};

export default SignUp;
