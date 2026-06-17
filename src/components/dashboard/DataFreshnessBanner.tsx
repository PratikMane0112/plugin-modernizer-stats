import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiLink from '@mui/material/Link';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import { colors } from '../../theme';

interface DataFreshnessBannerProps {
  generatedAt: string;
}

export default function DataFreshnessBanner({ generatedAt }: DataFreshnessBannerProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        background: `linear-gradient(to right, ${colors.primary.main}1a, ${colors.secondary.main}1a)`,
        border: `1px solid ${colors.primary.main}33`,
        borderRadius: '12px',
        px: 3,
        py: 1.5,
        gap: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccessTimeOutlined sx={{ fontSize: 16, color: colors.primary.light }} />
        <Typography sx={{ fontSize: '0.875rem', color: colors.text.body }}>
          Data generated:{' '}
          <Box component="span" sx={{ fontWeight: 600, color: colors.text.primary }}>
            {new Date(generatedAt).toLocaleString()}
          </Box>
        </Typography>
      </Box>
      <Typography sx={{ fontSize: '0.75rem', color: colors.text.muted }}>
        Source:{' '}
        <MuiLink
          href="https://github.com/jenkins-infra/metadata-plugin-modernizer"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: colors.primary.light }}
        >
          metadata-plugin-modernizer
        </MuiLink>
      </Typography>
    </Box>
  );
}
