import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Header() {
  return (
    <header className="chanel-header sticky top-0 z-50">
      <div className="chanel-container">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div>
              <h1 className="chanel-logo">MarkSlide</h1>
              <p className="chanel-tagline">Markdown to Slides</p>
            </div>
          </Link>

          <Link href="/settings">
            <Button variant="outline" size="sm" className="gap-2 chanel-button-outline">
              <Settings className="w-4 h-4" />
              설정
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
