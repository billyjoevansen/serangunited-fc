import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ScoreInput from './ScoreInput';
import PosturScoreInput from './PosturScoreInput';
import { FIELD_LABELS } from '@/utils/calculations';

const ScoreCategory = ({
  number,
  title,
  description,
  icon,
  fields,
  values,
  onChange,
  pemainData = null,
}) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Badge className="w-10 h-10 rounded-full flex items-center justify-center text-lg p-0">
            {number}
          </Badge>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>{icon}</span>
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {fields.map((field) => {
          if (field === 'postur' && pemainData) {
            return (
              <PosturScoreInput
                key={field}
                name={field}
                value={values[field]}
                onChange={onChange}
                tinggiBadan={pemainData.tinggi_badan}
                posisi={pemainData.posisi}
              />
            );
          }

          return (
            <ScoreInput
              key={field}
              label={FIELD_LABELS[field].label}
              name={field}
              description={FIELD_LABELS[field].description}
              value={values[field]}
              onChange={onChange}
            />
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ScoreCategory;
