import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Trash2,
  User,
  Calendar,
  MessageSquare,
  ChevronDown,
  Target,
  Zap,
  Brain,
  Heart,
  TrendingUp,
  Award,
  Pencil,
} from 'lucide-react';
import { formatDateTime } from '@/utils/formatters';
import { calculatePenilaianAverage, PENILAIAN_CATEGORIES } from '@/utils/calculations';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const PenilaianCard = ({ penilaian, onDelete, defaultExpanded = false }) => {
  const { isAdmin, user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const avg = parseFloat(calculatePenilaianAverage(penilaian));

  // Cek apakah user bisa edit (admin atau penilai yang sama)
  const canEdit = isAdmin || (user && penilaian.user_id === user.id);

  // Status berdasarkan skor
  const getStatus = (score) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-500' };
    if (score >= 75) return { label: 'Lolos', color: 'text-green-600', bg: 'bg-green-500' };
    if (score >= 60) return { label: 'Cukup', color: 'text-yellow-600', bg: 'bg-yellow-500' };
    if (score >= 40) return { label: 'Kurang', color: 'text-orange-600', bg: 'bg-orange-500' };
    return { label: 'Rendah', color: 'text-red-600', bg: 'bg-red-500' };
  };

  const status = getStatus(avg);

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark: text-red-400';
  };

  const getProgressColor = (score) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Label singkat untuk field
  const fieldLabels = {
    teknik_dasar: 'Teknik Dasar',
    keterampilan_spesifik: 'Skill Spesifik',
    keseimbangan: 'Keseimbangan',
    daya_tahan: 'Daya Tahan',
    kecepatan_kelincahan: 'Kecepatan',
    postur: 'Postur Tubuh',
    reading_game: 'Reading Game',
    decision_making: 'Decision Making',
    adaptasi: 'Adaptasi',
    mentalitas: 'Mentalitas',
    disiplin: 'Disiplin',
    team_player: 'Team Player',
    rekam_jejak: 'Rekam Jejak',
  };

  // Config kategori dengan icon dan warna
  const categoryConfig = {
    teknik: {
      icon: Target,
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50 dark:bg-blue-950/50',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900',
    },
    fisik: {
      icon: Zap,
      gradient: 'from-orange-500 to-amber-500',
      bg: 'bg-orange-50 dark:bg-orange-950/50',
      border: 'border-orange-200 dark:border-orange-800',
      text: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-100 dark:bg-orange-900',
    },
    taktik: {
      icon: Brain,
      gradient: 'from-purple-500 to-violet-500',
      bg: 'bg-purple-50 dark:bg-purple-950/50',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-100 dark:bg-purple-900',
    },
    mental: {
      icon: Heart,
      gradient: 'from-emerald-500 to-green-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900',
    },
  };

  // Hitung rata-rata per kategori
  const calculateCategoryAverage = (fields) => {
    const values = fields.map((field) => penilaian[field] || 0);
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  // Tentukan route edit berdasarkan role
  const getEditRoute = () => {
    if (isAdmin) {
      return `/admin/penilaian/${penilaian.id}/edit`;
    }
    return `/dashboard/penilaian/${penilaian.id}/edit`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Header dengan gradient accent */}
      <div
        className={cn(
          'h-1. 5 w-full bg-gradient-to-r',
          avg >= 75
            ? 'from-green-500 to-emerald-500'
            : avg >= 50
            ? 'from-yellow-500 to-orange-500'
            : 'from-red-500 to-rose-500'
        )}
      />

      <CardContent className="p-0">
        {/* Main Header */}
        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            {/* Left:  Penilai Info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                <AvatarImage src={penilaian.penilai_foto} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                  <User className="w-5 h-5 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-base">{penilaian.penilai_nama}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDateTime(penilaian.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Right: Score & Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Score Display */}
              <div className="flex items-center gap-3">
                {/* Score Circle */}
                <div className="relative">
                  <svg className="w-14 h-14 sm:w-16 sm:h-16 transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-muted/20"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${(avg / 100) * 151} 151`}
                      strokeLinecap="round"
                      className={cn(
                        avg >= 75
                          ? 'text-green-500'
                          : avg >= 50
                          ? 'text-yellow-500'
                          : 'text-red-500'
                      )}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cn('text-base sm:text-lg font-bold', status.color)}>
                      {avg.toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="hidden sm:flex flex-col items-start">
                  <Badge
                    variant={avg >= 75 ? 'default' : avg >= 50 ? 'secondary' : 'destructive'}
                    className="mb-1"
                  >
                    {avg >= 75 ? <TrendingUp className="w-3 h-3 mr-1" /> : null}
                    {status.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">dari 100</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                {/* Edit Button */}
                {canEdit && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          asChild
                        >
                          <Link to={getEditRoute()}>
                            <Pencil className="w-4 h-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit Penilaian</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Delete Button */}
                {onDelete && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={() => onDelete(penilaian.id, penilaian.penilai_nama)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Hapus Penilaian</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>

          {/* Category Summary - Always visible */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {Object.entries(PENILAIAN_CATEGORIES).map(([key, category]) => {
              const config = categoryConfig[key];
              const Icon = config.icon;
              const catAvg = calculateCategoryAverage(category.fields);

              return (
                <div
                  key={key}
                  className={cn(
                    'flex flex-col items-center p-2 rounded-lg transition-colors',
                    config.bg
                  )}
                >
                  <div className={cn('p-1. 5 rounded-full mb-1', config.iconBg)}>
                    <Icon className={cn('w-3. 5 h-3.5', config.text)} />
                  </div>
                  <span className={cn('text-lg font-bold', getScoreColor(catAvg))}>
                    {catAvg.toFixed(0)}
                  </span>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">
                    {category.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expandable Detail Section */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <button className="w-full px-4 py-3 flex items-center justify-center gap-2 bg-muted/50 hover:bg-muted transition-colors border-t text-sm font-medium text-muted-foreground">
              <span>{isExpanded ? 'Sembunyikan Detail' : 'Lihat Detail Penilaian'}</span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 transition-transform duration-200',
                  isExpanded && 'rotate-180'
                )}
              />
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="p-4 sm:p-5 pt-0 space-y-4 border-t">
              {/* Detail per Kategori */}
              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                {Object.entries(PENILAIAN_CATEGORIES).map(([key, category]) => {
                  const config = categoryConfig[key];
                  const Icon = config.icon;
                  const catAvg = calculateCategoryAverage(category.fields);

                  return (
                    <div
                      key={key}
                      className={cn(
                        'rounded-xl border p-4 transition-all hover:shadow-md',
                        config.bg,
                        config.border
                      )}
                    >
                      {/* Category Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={cn('p-2 rounded-lg', config.iconBg)}>
                            <Icon className={cn('w-4 h-4', config.text)} />
                          </div>
                          <div>
                            <p className={cn('font-semibold text-sm', config.text)}>
                              {category.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {category.fields.length} kriteria
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn('text-2xl font-bold', getScoreColor(catAvg))}>
                            {catAvg.toFixed(1)}
                          </p>
                        </div>
                      </div>

                      {/* Fields List */}
                      <div className="space-y-2.5">
                        {category.fields.map((field) => {
                          const score = penilaian[field] || 0;
                          return (
                            <div key={field} className="space-y-1">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{fieldLabels[field]}</span>
                                <span
                                  className={cn('font-bold tabular-nums', getScoreColor(score))}
                                >
                                  {score}
                                </span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    'h-full rounded-full transition-all duration-500',
                                    getProgressColor(score)
                                  )}
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Catatan */}
              {penilaian.catatan && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
                  <div className="flex gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg h-fit">
                      <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                        Catatan Penilai
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                        {penilaian.catatan}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Score Summary Footer */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Award className={cn('w-5 h-5', status.color)} />
                  <span className="text-sm font-medium">Skor Akhir</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={cn('text-3xl font-bold', status.color)}>{avg.toFixed(1)}</p>
                  </div>
                  <Badge
                    variant={avg >= 75 ? 'default' : 'destructive'}
                    className="text-sm px-3 py-1"
                  >
                    {avg >= 75 ? 'LOLOS' : 'TIDAK LOLOS'}
                  </Badge>
                </div>
              </div>

              {/* Edit Button for Mobile */}
              {canEdit && (
                <div className="sm:hidden pt-2">
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <Link to={getEditRoute()}>
                      <Pencil className="w-4 h-4" />
                      Edit Penilaian
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default PenilaianCard;
