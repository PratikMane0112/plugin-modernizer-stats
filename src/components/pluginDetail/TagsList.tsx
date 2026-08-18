import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { Migration } from '../../types';
import { colors } from '../../theme';

interface TagsListProps {
  migrations: Migration[];
}

export default function TagsList({ migrations }: TagsListProps) {
  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const m of migrations) {
      if (m.tags) {
        for (const t of m.tags) set.add(t);
      }
    }
    return [...set].sort();
  }, [migrations]);

  if (tags.length === 0) return null;

  return (
    <Box
      sx={{
        bgcolor: colors.bg.paper,
        p: { xs: 2, sm: 3 },
        borderRadius: '12px',
        border: `1px solid ${colors.border.default}`,
      }}
    >
      <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: colors.text.dark, mb: 1.5 }}>Tags</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            size="small"
            sx={{
              bgcolor: alpha(colors.primary.dark, 0.15),
              color: colors.primary.light,
              border: `1px solid ${alpha(colors.primary.dark, 0.3)}`,
              fontWeight: 500,
              fontSize: '0.8rem',
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
