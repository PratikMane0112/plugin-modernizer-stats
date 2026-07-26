import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
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

function statusConfig(status: string): { label: string; color: string } {
  if (status === 'success') return { label: '\u2713 Success', color: colors.success.main };
  if (status === 'fail') return { label: '\u2717 Failed', color: colors.error.main };
  return { label: '? Unknown', color: colors.text.muted };
}

interface RecipePluginsTableProps {
  recipe: RecipeReport;
}

export default function RecipePluginsTable({ recipe }: RecipePluginsTableProps) {
  const navigate = useNavigate();

  const sorted = useMemo(
    () => [...recipe.plugins].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [recipe.plugins]
  );

  if (sorted.length === 0) return null;

  return (
    <Box
      sx={{
        bgcolor: colors.bg.paper,
        borderRadius: '12px',
        border: `1px solid ${colors.border.default}`,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 1.5 }}>
        <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: colors.text.primary }}>
          Affected Plugins ({sorted.length})
        </Typography>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>Plugin</TableCell>
              <TableCell sx={headerCellSx} align="center">
                Status
              </TableCell>
              <TableCell sx={headerCellSx} align="right">
                Date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((p, i) => {
              const { label, color } = statusConfig(p.status);
              return (
                <TableRow
                  key={`${p.pluginName}-${i}`}
                  onClick={() => navigate(`/plugins/${encodeURIComponent(p.pluginName)}`)}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: colors.bg.hoverSubtle } }}
                >
                  <TableCell sx={{ ...cellSx, color: colors.primary.light, fontWeight: 500 }}>{p.pluginName}</TableCell>
                  <TableCell sx={cellSx} align="center">
                    <Chip
                      label={label}
                      size="small"
                      sx={{
                        bgcolor: alpha(color, 0.15),
                        color,
                        border: `1px solid ${alpha(color, 0.3)}`,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ ...cellSx, fontFamily: 'monospace' }} align="right">
                    {formatTimestamp(p.timestamp)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
