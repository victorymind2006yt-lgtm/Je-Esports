import { Users } from "lucide-react";

type SoloSlotGridProps = {
  slots: Array<{
    slotNumber: number;
    registration?: {
      userId: string;
      userName: string;
      userPhotoURL?: string;
    };
  }>;
  currentUserId?: string;
  selectedSlot: number | null;
  canRegister: boolean;
  registering: boolean;
  onSlotSelect: (slotNumber: number) => void;
};

export default function SoloSlotGrid({
  slots,
  currentUserId,
  selectedSlot,
  canRegister,
  registering,
  onSlotSelect,
}: SoloSlotGridProps) {
  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
      {slots.map(({ slotNumber, registration }) => {
        const isYou = !!registration && !!currentUserId && registration.userId === currentUserId;
        const isTaken = !!registration;
        const isSelected = selectedSlot === slotNumber;
        const disabled = !canRegister || isTaken || registering;

        return (
          <button
            key={slotNumber}
            type="button"
            disabled={disabled}
            onClick={() => onSlotSelect(slotNumber)}
            className={`relative flex items-center justify-center rounded-xl border aspect-square text-2xl font-bold transition ${isYou
                ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                : isTaken
                  ? "border-white/20 bg-black/30 text-white/40"
                  : isSelected
                    ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                    : "border-white/10 bg-black/30 text-white/60 hover:border-emerald-400 hover:bg-emerald-500/5 hover:text-white"
              } ${disabled
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer"
              }`}
          >
            {isTaken && registration ? (
              <div className="flex flex-col items-center">
                {registration.userPhotoURL ? (
                  <div className="mb-1 h-8 w-8 overflow-hidden rounded-full border border-white/20">
                    <img
                      src={registration.userPhotoURL}
                      alt={registration.userName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-semibold text-emerald-300 mb-1">
                    {registration.userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-[10px] font-medium">#{slotNumber}</span>
              </div>
            ) : (
              slotNumber
            )}
          </button>
        );
      })}
    </div>
  );
}
