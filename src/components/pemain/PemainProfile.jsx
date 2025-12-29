import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Ruler, Weight, Phone, Mail } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import ScoreDisplay from '@/components/common/ScoreDisplay';
import InfoTinggiBadan from './InfoTinggiBadan';
import { calculateAge } from '@/utils/calculations';

const PemainProfile = ({ pemain, showInfoTinggiBadan = true }) => {
  const umur = pemain.tanggal_lahir ? calculateAge(pemain.tanggal_lahir) : null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <Avatar className="w-32 h-32 border-4 border-primary/20">
            <AvatarImage src={pemain.foto_url} alt={pemain.nama} />
            <AvatarFallback className="text-5xl bg-primary/10">⚽</AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{pemain.nama}</h1>
              <Badge variant="secondary" className="mt-1 text-base">
                {pemain.posisi}
              </Badge>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              {umur && (
                <div className="flex items-center gap-1. 5 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{umur} tahun</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Ruler className="w-4 h-4" />
                <span>{pemain.tinggi_badan} cm</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Weight className="w-4 h-4" />
                <span>{pemain.berat_badan} kg</span>
              </div>
            </div>

            {(pemain.no_telepon || pemain.email) && (
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                {pemain.no_telepon && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{pemain.no_telepon}</span>
                  </div>
                )}
                {pemain.email && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{pemain.email}</span>
                  </div>
                )}
              </div>
            )}

            {showInfoTinggiBadan && pemain.tinggi_badan && (
              <div className="mt-4">
                <InfoTinggiBadan tinggiBadan={pemain.tinggi_badan} posisi={pemain.posisi} />
              </div>
            )}
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-3 p-4 border-2 rounded-xl bg-muted/50">
            <ScoreDisplay nilai={pemain.nilai_rata_rata} size="lg" />
            <StatusBadge
              status={pemain.status_kelayakan}
              nilai={pemain.nilai_rata_rata}
              size="md"
            />
            <p className="text-xs text-muted-foreground">{pemain.jumlah_penilaian} penilaian</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PemainProfile;
