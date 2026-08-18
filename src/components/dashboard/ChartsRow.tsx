import { Link } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiLink from '@mui/material/Link';
import { colors } from '../../theme';

const cardSx = {
  bgcolor: colors.bg.paper,
  p: 3,
  borderRadius: '12px',
  border: `1px solid ${colors.border.default}`,
};

interface ChartsRowProps {
  migrationStatusOption: Record<string, unknown>;
  topRecipesOption: Record<string, unknown>;
}

export default function ChartsRow({ migrationStatusOption, topRecipesOption }: ChartsRowProps) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      <Box sx={{ flex: '1 1 340px', minWidth: 0 }}>
        <Box sx={cardSx}>
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: colors.text.dark, mb: 2 }}>
            Migration Status
          </Typography>
          <ReactECharts option={migrationStatusOption} style={{ height: '350px' }} theme="dark" />
        </Box>
      </Box>
      <Box sx={{ flex: '1 1 340px', minWidth: 0 }}>
        <Box sx={cardSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: colors.text.dark }}>
              Recipe Performance
            </Typography>
            <MuiLink
              component={Link}
              to="/recipes"
              sx={{
                fontSize: '0.875rem',
                color: colors.primary.light,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              View all &rarr;
            </MuiLink>
          </Box>
          <ReactECharts option={topRecipesOption} style={{ height: '350px' }} theme="dark" />
        </Box>
      </Box>
    </Box>
  );
}
