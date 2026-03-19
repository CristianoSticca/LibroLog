'use client';

interface RatingStarsProps {
  value: number;
  onChange?: (v: number) => void;
  size?: 'sm' | 'md';
}

export default function RatingStars({ value, onChange, size = 'md' }: RatingStarsProps) {
  const sz = size === 'sm' ? 'text-base' : 'text-2xl';
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          disabled={!onChange}
          className={`material-symbols-outlined ${sz} transition-colors ${
            star <= value ? 'text-[#392117]' : 'text-[#c4c6cd]'
          } ${onChange ? 'cursor-pointer hover:text-[#392117]' : 'cursor-default'}`}
          style={{ fontVariationSettings: star <= value ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </button>
      ))}
    </div>
  );
}
