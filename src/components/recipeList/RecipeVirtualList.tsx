import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import { List } from 'react-window';
import type { RecipeReport } from '../../types';
import { colors } from '../../theme';
import RecipeRow from './RecipeRow';

const ROW_HEIGHT = 72;

interface VirtualRowProps {
  recipes: RecipeReport[];
}

function VirtualRow({ index, style, recipes }: { index: number; style: React.CSSProperties } & VirtualRowProps) {
  return <RecipeRow recipe={recipes[index]} style={style} />;
}

interface RecipeVirtualListProps {
  recipes: RecipeReport[];
  onClearFilters: () => void;
}

export default function RecipeVirtualList({ recipes, onClearFilters }: RecipeVirtualListProps) {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: { xs: 350, sm: 200 },
        bgcolor: colors.bg.paper,
        borderRadius: '12px',
        border: `1px solid ${colors.border.default}`,
        overflow: 'hidden',
      }}
    >
      {recipes.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            gap: 1,
            p: 4,
          }}
        >
          <SearchIcon sx={{ fontSize: { xs: 36, sm: 44 }, color: colors.text.disabled }} />
          <Typography sx={{ color: colors.text.muted, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            No recipes found
          </Typography>
          <Typography
            component="button"
            type="button"
            onClick={onClearFilters}
            sx={{
              all: 'unset',
              cursor: 'pointer',
              color: colors.primary.light,
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              '&:hover': { textDecoration: 'underline' },
              '&:focus-visible': { outline: `2px solid ${colors.primary.light}`, outlineOffset: 2 },
            }}
          >
            Clear filters
          </Typography>
        </Box>
      ) : (
        <List<VirtualRowProps>
          rowComponent={VirtualRow}
          rowCount={recipes.length}
          rowHeight={ROW_HEIGHT}
          rowProps={{ recipes }}
          style={{ height: '100%' }}
        />
      )}
    </Box>
  );
}
