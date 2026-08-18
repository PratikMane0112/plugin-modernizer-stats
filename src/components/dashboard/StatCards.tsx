import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import AccountTreeOutlined from '@mui/icons-material/AccountTreeOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import type { ReportJson } from '../../types';
import { colors } from '../../theme';

const StatCard = ({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}) => (
  <Box
    sx={{
      bgcolor: colors.bg.paper,
      p: { xs: 2, sm: 3 },
      borderRadius: '12px',
      border: `1px solid ${colors.border.default}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1.5,
      height: '100%',
      transition: 'transform 0.15s, border-color 0.15s',
      '&:hover': { transform: 'scale(1.02)', borderColor: colors.border.hover },
    }}
  >
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography
        sx={{
          fontSize: { xs: '0.75rem', sm: '0.8125rem' },
          fontWeight: 500,
          color: colors.text.muted,
          mb: 0.25,
          lineHeight: 1.3,
        }}
      >
        {title}
      </Typography>
      <Typography sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 700, color: colors.text.dark }}>
        {value}
      </Typography>
      {subtitle && <Typography sx={{ fontSize: '0.75rem', color: colors.text.muted, mt: 0.25 }}>{subtitle}</Typography>}
    </Box>
    <Box
      aria-hidden="true"
      sx={{
        p: { xs: 1, sm: 1.5 },
        borderRadius: '50%',
        bgcolor: `${color}55`,
        border: `1px solid ${color}88`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color,
        '& .MuiSvgIcon-root': { fontSize: { xs: 20, sm: 24 } },
      }}
    >
      {icon}
    </Box>
  </Box>
);

interface StatCardsProps {
  overview: ReportJson['overview'];
}

export default function StatCards({ overview }: StatCardsProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: { xs: 1.5, sm: 2 },
      }}
    >
      {[
        {
          title: 'Total Plugins',
          value: overview.totalPlugins,
          icon: <Inventory2Outlined />,
          color: colors.cyan.dark,
        },
        {
          title: 'Total Migrations',
          value: overview.totalMigrations,
          icon: <AccountTreeOutlined />,
          color: colors.orange.light,
        },
        {
          title: 'Successful Migrations',
          value: overview.successfulMigrations,
          icon: <CheckCircleOutlined />,
          color: colors.success.light,
        },
        {
          title: 'Failed Migrations',
          value: overview.failedMigrations,
          icon: <CancelOutlined />,
          color: colors.error.light,
        },
      ].map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </Box>
  );
}
