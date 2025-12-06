import { Oath } from '../App';

interface OathSealedModalProps {
  oath: Oath;
  onClose: () => void;
}

export function OathSealedModal({ oath, onClose }: OathSealedModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50">
      <div className="relative max-w-2xl w-full">
        {/* Celebration effects */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-9xl animate-bounce">⭐</div>
        </div>

        {/* Scroll background */}
        <div className="relative bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-3xl border-8 border-yellow-700 shadow-2xl p-12 transform rotate-[-1deg]">
          <div className="bg-yellow-100 rounded-2xl border-4 border-yellow-800 p-8 relative overflow-hidden">
            {/* Wax seals */}
            <div className="absolute top-4 left-4 w-16 h-16 bg-red-700 rounded-full border-4 border-red-900 flex items-center justify-center text-2xl shadow-lg">
              🔒
            </div>
            <div className="absolute top-4 right-4 w-16 h-16 bg-red-700 rounded-full border-4 border-red-900 flex items-center justify-center text-2xl shadow-lg">
              🔒
            </div>
            <div className="absolute bottom-4 right-8 w-20 h-20 bg-red-700 rounded-full border-4 border-red-900 flex items-center justify-center text-3xl shadow-lg">
              💍
            </div>

            {/* Main content */}
            <div className="text-center space-y-6 pt-8">
              <div className="bg-yellow-400 text-black px-12 py-6 rounded-2xl border-4 border-black shadow-xl inline-block">
                <span className="text-3xl">Oath Sealed!</span>
              </div>

              <div className="text-black space-y-4 text-lg italic max-w-md mx-auto bg-white/50 p-6 rounded-xl">
                <p>I pledge to stop {oath.habit}</p>
                {oath.length === 'forever' ? (
                  <p>Forever and always</p>
                ) : (
                  <p>For {oath.length} days</p>
                )}
                <p>I stopped on {new Date(oath.startDate).toLocaleDateString()}</p>
                {oath.endDate && (
                  <p>I can resume on {new Date(oath.endDate).toLocaleDateString()}</p>
                )}
              </div>

              <div className="text-6xl">📜</div>

              <button
                onClick={onClose}
                className="bg-yellow-400 hover:bg-yellow-300 text-black px-12 py-4 rounded-xl border-4 border-black shadow-lg transition-colors"
              >
                Begin Journey
              </button>
            </div>
          </div>
        </div>

        {/* Lightning bolts */}
        <div className="absolute -top-8 -right-8 text-6xl animate-pulse">⚡</div>
        <div className="absolute -bottom-8 -left-8 text-6xl animate-pulse">⚡</div>
      </div>
    </div>
  );
}
