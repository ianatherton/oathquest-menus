import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

const APP_VERSION = '0.0.1';
const FIRST_VISIT_KEY = 'oathquest_seen_info';

const DISCLAIMER = `Legal Disclaimer: OathQuest is a habit-tracking tool provided "as-is" without warranty. It does not constitute medical or psychiatric advice. This service should not be used to discontinue necessary medical treatments or positive health routines. The creators accept no liability for any actions taken or outcomes experienced by users resulting from the use or misuse of this application.`;

const PRIVACY_POLICY = `1. Data Storage & Ownership
OathQuest operates on a "Local-First" basis. All habit data, durations, and logs are stored locally on your device. We do not require user accounts, email addresses, or phone numbers to use the application. You own your data.

2. Cross-Device Transfer
To facilitate moving your progress between devices, the app may generate a unique, anonymous hash string (code). This code contains only the encrypted data required to restore your progress. It is not linked to any personal identity or user profile.

3. Internet Connectivity
The application uses your device's internet connection strictly for:
• Verifying accurate time synchronization (to prevent time-tampering in the game system).
• Anonymous usage analytics (see below).

4. Analytics & Improvements
We may employ anonymous data logging (cookies or similar identifiers) to help us understand app stability and improve the user experience. This data is encrypted, aggregated, and cannot be used to identify you personally or reveal the specific nature of the habits you are tracking.

5. Changes to This Policy
We reserve the right to update this policy as the application evolves. Continued use of OathQuest signifies your acceptance of these terms.`;

export function AppInfoModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenInfo = localStorage.getItem(FIRST_VISIT_KEY);
    if (!hasSeenInfo) setOpen(true);
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) localStorage.setItem(FIRST_VISIT_KEY, 'true'); // mark as seen on close
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="text-purple-200 hover:text-white transition-colors text-sm flex items-center gap-1.5 opacity-80 hover:opacity-100">
          <Info size={14} />
          <span>App Info</span>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-purple-950 border-4 border-black text-white max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-yellow-400 text-xl">OathQuest</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4 -mr-4">
          <div className="space-y-6 pb-2">
            <section>
              <h3 className="text-yellow-400 font-semibold mb-1">Version</h3>
              <p className="text-purple-200">{APP_VERSION}</p>
            </section>
            <section>
              <h3 className="text-yellow-400 font-semibold mb-1">Credits</h3>
              <p className="text-purple-200 text-sm leading-relaxed">
                UI Components from shadcn/ui (MIT License)
                <br />
                Icons from Lucide React
              </p>
            </section>
            <section>
              <h3 className="text-yellow-400 font-semibold mb-2">Legal Disclaimer</h3>
              <p className="text-purple-200 text-sm leading-relaxed">{DISCLAIMER}</p>
            </section>
            <section>
              <h3 className="text-yellow-400 font-semibold mb-2">Privacy Policy</h3>
              <p className="text-purple-200 text-sm leading-relaxed whitespace-pre-line">{PRIVACY_POLICY}</p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

