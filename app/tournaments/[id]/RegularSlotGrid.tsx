type RegularSlotGridProps = {
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

export default function RegularSlotGrid({
    slots,
    currentUserId,
    selectedSlot,
    canRegister,
    registering,
    onSlotSelect,
}: RegularSlotGridProps) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
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
                        className={`flex flex-col items-center justify-center rounded-xl border px-2 py-2 text-xs transition ${isYou
                            ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                            : isTaken
                                ? "border-white/20 bg-black/30 text-white/60"
                                : isSelected
                                    ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                                    : "border-white/10 bg-black/30 text-white/80 hover:border-emerald-400 hover:bg-emerald-500/5"
                            } ${disabled
                                ? "cursor-not-allowed opacity-60"
                                : "cursor-pointer"
                            }`}
                    >
                        {isTaken && registration?.userPhotoURL ? (
                            <div className="mb-1 h-8 w-8 overflow-hidden rounded-full border border-white/20">
                                <img
                                    src={registration.userPhotoURL}
                                    alt={registration.userName}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ) : (
                            <span className="text-[10px] uppercase tracking-[0.18em] text-white/50">
                                Slot {slotNumber}
                            </span>
                        )}
                        <span className="mt-1 text-xs font-semibold">
                            {isYou
                                ? "You"
                                : isTaken
                                    ? registration?.userName || "Taken"
                                    : "Empty"}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
