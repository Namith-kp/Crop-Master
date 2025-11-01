import React from "react";
import CropResultClient from "./CropResultClient";

export default function CropResultPage() {
  return (
    <React.Suspense fallback={<div />}> 
      <CropResultClient />
    </React.Suspense>
  );
}
