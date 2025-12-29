import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ScoreInput = ({ label, name, description, value, onChange }) => {
  const getScoreColor = (score) => {
    if (score >= 75) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 50) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const handleSliderChange = (newValue) => {
    onChange({ target: { name, value: newValue[0] } });
  };

  return (
    <div className="space-y-3 mb-6">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">{label}</Label>
        <Badge
          variant="outline"
          className={cn('text-lg font-bold px-3 py-1', getScoreColor(value))}
        >
          {value}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">{description}</p>

      <Slider
        value={[value]}
        onValueChange={handleSliderChange}
        max={100}
        step={1}
        className="w-full"
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
    </div>
  );
};

export default ScoreInput;
