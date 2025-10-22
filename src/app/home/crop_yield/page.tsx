// app/home/crop-yield/page.tsx
import { CropYieldForm } from '@/components/crop-yield-form';
import { ThemeToggle } from '@/components/theme-toggle';

export default function CropYieldPage() {
  return (
    <main className="min-h-screen bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <CropYieldForm />
    </main>
  );
}
