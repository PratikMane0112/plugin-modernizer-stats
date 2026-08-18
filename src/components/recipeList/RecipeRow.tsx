import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';
import type { RecipeReport } from '../../types';
import { colors } from '../../theme';
import { shortRecipeName, computeSuccessRate } from '../../util/recipeStatus';
import SuccessRateBadge from '../common/SuccessRateBadge';

interface RecipeRowProps {
  recipe: RecipeReport;
  style: React.CSSProperties;
}

export default function RecipeRow({ recipe, style }: RecipeRowProps) {
  const navigate = useNavigate();
  const displayName = shortRecipeName(recipe.recipeId);

  return (
    <Box
      role="button"
      tabIndex={0}
      style={style}
      onClick={() => navigate(`/recipes/${encodeURIComponent(recipe.recipeId)}`)}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/recipes/${encodeURIComponent(recipe.recipeId)}`);
        }
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: { xs: 1.5, sm: 2 },
        gap: { xs: 1, sm: 2 },
        cursor: 'pointer',
        borderBottom: `1px solid ${colors.border.default}`,
        '&:hover': { bgcolor: colors.bg.hoverSubtle },
        '&:focus-visible': { outline: `2px solid ${colors.primary.dark}`, outlineOffset: -2 },
      }}
    >
      <Box sx={{ flex: 1, minWidth: { xs: 80, sm: 120 }, overflow: 'hidden' }}>
        <Typography
          sx={{
            color: colors.text.dark,
            fontSize: { xs: '0.8rem', sm: '0.95rem' },
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={recipe.recipeId}
        >
          {displayName}
        </Typography>
      </Box>

      <Box sx={{ flexShrink: 0 }}>
        <SuccessRateBadge rate={computeSuccessRate(recipe)} size="small" />
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 0.5, sm: 1.5 },
          ml: 'auto',
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            color: colors.success.light,
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          {recipe.successCount}
          <Typography component="span" sx={{ color: colors.text.muted, fontWeight: 400 }}>
            /{recipe.totalApplications}
          </Typography>
        </Typography>

        <Typography
          sx={{
            color: colors.error.light,
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
            fontWeight: 600,
            display: { xs: 'none', sm: 'block' },
            whiteSpace: 'nowrap',
          }}
        >
          {recipe.failureCount}
          <Typography component="span" sx={{ color: colors.text.muted, fontWeight: 400 }}>
            {' '}
            fail
          </Typography>
        </Typography>
      </Box>

      <ChevronRightIcon sx={{ color: colors.text.disabled, fontSize: 20, flexShrink: 0 }} aria-hidden="true" />
    </Box>
  );
}
