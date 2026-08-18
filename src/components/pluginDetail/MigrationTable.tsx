import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Migration } from '../../types';
import { colors } from '../../theme';
import MigrationCard from './MigrationCard';

interface MigrationTableProps {
  migrations: Migration[];
}

export default function MigrationTable({ migrations }: MigrationTableProps) {
  const sorted = useMemo(() => {
    return [...migrations].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [migrations]);

  if (sorted.length === 0) {
    return (
      <Box
        sx={{
          bgcolor: colors.bg.paper,
          p: 3,
          borderRadius: '12px',
          border: `1px solid ${colors.border.default}`,
          textAlign: 'center',
        }}
      >
        <Typography sx={{ color: colors.text.muted }}>No migration data available</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: colors.text.dark }}>
          Migration History ({sorted.length})
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sorted.map((m, i) => (
          <MigrationCard key={`${m.migrationId}-${m.timestamp}-${i}`} migration={m} />
        ))}
      </Box>
    </Box>
  );
}
