import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import type { RecipeReport } from '../../types';
import { colors } from '../../theme';

const cellSx = {
  color: colors.text.secondary,
  fontSize: '0.85rem',
  borderColor: colors.border.default,
  py: 1.5,
} as const;

const headerCellSx = {
  color: colors.text.muted,
  fontWeight: 600,
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  borderColor: colors.border.default,
  bgcolor: colors.bg.paper,
} as const;

function formatTimestamp(ts: string): string {
  const normalized = ts.replace(/T(\d{2})-(\d{2})-(\d{2})$/, 'T$1:$2:$3');
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return ts;
  return date.toLocaleDateString('en-CA');
}

interface RecipeFailuresBreakdownProps {
  recipe: RecipeReport;
}

export default function RecipeFailuresBreakdown({ recipe }: RecipeFailuresBreakdownProps) {
  const navigate = useNavigate();

  const failed = useMemo(
    () => recipe.plugins.filter((p) => p.status === 'fail').sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [recipe.plugins]
  );

  if (failed.length === 0) return null;

  return (
    <Box
      sx={{
        bgcolor: colors.bg.paper,
        borderRadius: '12px',
        border: `1px solid ${alpha(colors.error.main, 0.3)}`,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningAmberOutlined sx={{ fontSize: 20, color: colors.warning.main }} />
        <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: colors.text.primary }}>
          Failed Plugins ({failed.length})
        </Typography>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>Plugin</TableCell>
              <TableCell sx={headerCellSx} align="right">
                Date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {failed.map((p, i) => (
              <TableRow
                key={`${p.pluginName}-${i}`}
                onClick={() => navigate(`/plugins/${encodeURIComponent(p.pluginName)}`)}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: colors.bg.hoverSubtle } }}
              >
                <TableCell sx={{ ...cellSx, color: colors.error.light, fontWeight: 500 }}>{p.pluginName}</TableCell>
                <TableCell sx={{ ...cellSx, fontFamily: 'monospace' }} align="right">
                  {formatTimestamp(p.timestamp)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
