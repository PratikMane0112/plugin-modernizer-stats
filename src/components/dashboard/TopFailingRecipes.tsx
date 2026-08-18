import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiLink from '@mui/material/Link';
import { colors } from '../../theme';
import { shortRecipeName } from '../../util/recipeStatus';

const cardSx = {
  bgcolor: colors.bg.paper,
  p: 3,
  borderRadius: '12px',
  border: `1px solid ${colors.border.default}`,
};

interface TopFailingRecipesProps {
  recipes: Array<{
    recipeId: string;
    failures: number;
    successCount: number;
    failureCount: number;
  }>;
}

export default function TopFailingRecipes({ recipes }: TopFailingRecipesProps) {
  if (recipes.length === 0) return null;

  return (
    <Box sx={cardSx}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: colors.text.dark }}>
          Recipes with Most Failures
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
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {recipes.map((recipe) => {
          const shortName = shortRecipeName(recipe.recipeId);
          const completed = recipe.successCount + recipe.failureCount;
          const successPct = completed > 0 ? (recipe.successCount / completed) * 100 : 0;
          const failPct = completed > 0 ? (recipe.failureCount / completed) * 100 : 0;
          return (
            <Box key={recipe.recipeId} sx={{ flex: '1 1 200px', minWidth: 0 }}>
              <Box
                component={Link}
                to={`/recipes/${encodeURIComponent(recipe.recipeId)}`}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  p: 1.5,
                  height: '100%',
                  bgcolor: colors.bg.default,
                  borderRadius: '8px',
                  border: `1px solid ${colors.border.default}`,
                  textDecoration: 'none',
                  transition: 'border-color 0.15s, background 0.15s',
                  '&:hover': { borderColor: `${colors.orange.light}66`, bgcolor: colors.bg.hoverSubtle },
                }}
              >
                <Typography
                  title={shortName}
                  sx={{
                    color: colors.text.emphasis,
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {shortName}
                </Typography>
                <Box
                  role="progressbar"
                  aria-label={`${successPct.toFixed(0)}% success, ${failPct.toFixed(0)}% failure`}
                  sx={{ width: '100%', height: 6, borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}
                >
                  <Box sx={{ height: '100%', bgcolor: colors.success.light, width: `${successPct}%` }} />
                  <Box sx={{ height: '100%', bgcolor: colors.error.light, width: `${failPct}%` }} />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Typography
                      component="span"
                      sx={{ color: colors.success.light, fontWeight: 500, fontSize: 'inherit' }}
                    >
                      &#10003; {recipe.successCount}
                    </Typography>
                    <Typography
                      component="span"
                      sx={{ color: colors.error.light, fontWeight: 500, fontSize: 'inherit' }}
                    >
                      &#10007; {recipe.failureCount}
                    </Typography>
                  </Box>
                  <Typography component="span" sx={{ color: colors.text.muted, fontSize: 'inherit', flexShrink: 0 }}>
                    {successPct.toFixed(0)}% success
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
