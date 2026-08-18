import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { alpha } from '@mui/material/styles';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import type { Migration } from '../../types';
import { colors } from '../../theme';

const cellSx = {
  color: colors.text.muted,
  fontSize: '0.85rem',
  borderColor: colors.border.default,
  py: 1.5,
  fontFamily: 'monospace',
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

interface FailedMigrationsTableProps {
  migrations: Migration[];
}

export default function FailedMigrationsTable({ migrations }: FailedMigrationsTableProps) {
  const failed = useMemo(() => migrations.filter((m) => m.migrationStatus === 'fail'), [migrations]);

  if (failed.length === 0) return null;

  return (
    <Box
      sx={{
        bgcolor: colors.bg.paper,
        borderRadius: '12px',
        border: `1px solid ${alpha(colors.error.light, 0.3)}`,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningAmberOutlined sx={{ fontSize: 20, color: colors.warning.dark }} />
        <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: colors.text.dark }}>
          Failed Migrations
        </Typography>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>migrationId</TableCell>
              <TableCell sx={headerCellSx} align="right">
                migrationStatus
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {failed.map((m, i) => (
              <TableRow key={`${m.migrationId}-${i}`} sx={{ '&:hover': { bgcolor: colors.bg.hoverSubtle } }}>
                <TableCell sx={cellSx}>{m.migrationId}</TableCell>
                <TableCell sx={{ ...cellSx, color: colors.error.light, fontWeight: 600 }} align="right">
                  {m.migrationStatus}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
