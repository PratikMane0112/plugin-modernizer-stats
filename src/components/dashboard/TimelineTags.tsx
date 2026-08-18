import ReactECharts from 'echarts-for-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LabelOutlined from '@mui/icons-material/LabelOutlined';
import { colors } from '../../theme';

const cardSx = {
  bgcolor: colors.bg.paper,
  p: 3,
  borderRadius: '12px',
  border: `1px solid ${colors.border.default}`,
};

interface TimelineTagsProps {
  timelineOption: Record<string, unknown> | null;
  tagsOption: Record<string, unknown> | null;
}

export default function TimelineTags({ timelineOption, tagsOption }: TimelineTagsProps) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      <Box sx={{ flex: '1 1 340px', minWidth: 0 }}>
        <Box sx={cardSx}>
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: colors.text.dark, mb: 2 }}>
            Migration Timeline
          </Typography>
          {timelineOption ? (
            <ReactECharts option={timelineOption} style={{ height: '400px' }} theme="dark" />
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 400,
                color: colors.text.muted,
                fontSize: '0.875rem',
              }}
            >
              Historical timeline data not yet available.
            </Box>
          )}
        </Box>
      </Box>
      {tagsOption && (
        <Box sx={{ flex: '1 1 340px', minWidth: 0 }}>
          <Box sx={cardSx}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LabelOutlined sx={{ fontSize: 18, color: colors.cyan.dark }} />
              <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: colors.text.dark }}>
                Migration Tags
              </Typography>
            </Box>
            <ReactECharts option={tagsOption} style={{ height: '400px' }} theme="dark" />
          </Box>
        </Box>
      )}
    </Box>
  );
}
