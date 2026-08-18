import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import { colors } from '../../theme';

interface FooterSummaryProps {
  successRate: string;
  totalPlugins: number;
  totalMigrations: number;
  recipesCount: number;
}

export default function FooterSummary({
  successRate,
  totalPlugins,
  totalMigrations,
  recipesCount,
}: FooterSummaryProps) {
  return (
    <Box
      sx={{
        background: `linear-gradient(to right, ${colors.border.default}80, ${colors.bg.default}80)`,
        p: 2,
        borderRadius: '12px',
        border: `1px solid ${colors.border.default}`,
        display: { xs: 'grid', sm: 'flex' },
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: { xs: 1.5, sm: 3 },
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Typography
        sx={{
          color: colors.text.muted,
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
        }}
      >
        <TrendingUpOutlined sx={{ fontSize: 14 }} />
        Success :{' '}
        <Box component="span" sx={{ color: colors.text.dark, fontWeight: 700 }}>
          {successRate}%
        </Box>
      </Typography>
      <Box component="span" sx={{ color: colors.text.disabled, display: { xs: 'none', sm: 'inline' } }}>
        |
      </Box>
      <Typography sx={{ color: colors.text.muted, fontSize: '0.875rem' }}>
        Plugins:{' '}
        <Box component="span" sx={{ color: colors.cyan.dark, fontWeight: 700 }}>
          {totalPlugins}
        </Box>
      </Typography>
      <Box component="span" sx={{ color: colors.text.disabled, display: { xs: 'none', sm: 'inline' } }}>
        |
      </Box>
      <Typography sx={{ color: colors.text.muted, fontSize: '0.875rem' }}>
        Migrations:{' '}
        <Box component="span" sx={{ color: colors.orange.light, fontWeight: 700 }}>
          {totalMigrations}
        </Box>
      </Typography>
      <Box component="span" sx={{ color: colors.text.disabled, display: { xs: 'none', sm: 'inline' } }}>
        |
      </Box>
      <Typography sx={{ color: colors.text.muted, fontSize: '0.875rem' }}>
        Recipes:{' '}
        <Box component="span" sx={{ color: colors.pink.dark, fontWeight: 700 }}>
          {recipesCount}
        </Box>
      </Typography>
    </Box>
  );
}
