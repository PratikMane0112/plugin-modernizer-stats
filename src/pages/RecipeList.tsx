import { useMemo, useState, useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { VariableSizeList } from 'react-window';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Search, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { useElementSize } from '../hooks/useElementSize';
import { useMetadata } from '../hooks/useMetadata';
import { ErrorBanner } from '../components/ErrorBanner';
import { SuccessRateBadge } from '../components/SuccessRateBadge';
import { getRateTier } from '../lib/rateTier';
import type { RecipeReport } from '../types';

type SortField = 'name' | 'totalApplications' | 'successCount' | 'failureCount' | 'successRate';
type SortDir = 'asc' | 'desc';
type RateFilter = 'all' | 'high' | 'medium' | 'low';

const RECIPE_ROW_DESKTOP_PX = 72;
const RECIPE_ROW_NARROW_PX = 112;

const inputSx = {
    '& .MuiOutlinedInput-root': {
        bgcolor: '#15171a',
        color: '#e2e8f0',
        borderRadius: '8px',
        '& fieldset': { borderColor: '#334155' },
        '&:hover fieldset': { borderColor: '#475569' },
        '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
    },
    '& input::placeholder': { color: '#475569', opacity: 1 },
};

const selectSx = {
    bgcolor: '#15171a', color: '#e2e8f0', borderRadius: '8px',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#475569' },
    '& .MuiSvgIcon-root': { color: '#94a3b8' },
};

const menuPropsSx = { PaperProps: { sx: { bgcolor: '#1e2329', border: '1px solid #334155' } } };

export const RecipeList = () => {
    const theme = useTheme();
    const isNarrow = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchTerm, setSearchTerm] = useState('');
    const [rateFilter, setRateFilter] = useState<RateFilter>('all');
    const [sortField, setSortField] = useState<SortField>('failureCount');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const { recipes, loading, error } = useMetadata();
    const { ref: listViewportRef, width: listWidth, height: listHeight } = useElementSize<HTMLDivElement>();
    const listRef = useRef<VariableSizeList>(null);

    const rowHeight = isNarrow ? RECIPE_ROW_NARROW_PX : RECIPE_ROW_DESKTOP_PX;

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir(field === 'name' ? 'asc' : 'desc');
        }
    };

    const renderSortIcon = (field: SortField) => {
        if (sortField !== field) return <ChevronDown size={14} style={{ color: '#475569' }} />;
        return sortDir === 'asc'
            ? <ChevronUp size={14} style={{ color: '#60a5fa' }} />
            : <ChevronDown size={14} style={{ color: '#60a5fa' }} />;
    };

    const filtered = useMemo(() => {
        if (!recipes) return [];
        const q = searchTerm.toLowerCase();
        const list = recipes.filter((recipe: RecipeReport) => {
            const matchesSearch = recipe.recipeId.toLowerCase().includes(q);
            if (!matchesSearch) return false;
            if (rateFilter === 'all') return true;
            const tier = getRateTier(recipe.successRate);
            return tier === rateFilter;
        });
        const sorted = [...list].sort((a, b) => {
            const dir = sortDir === 'asc' ? 1 : -1;
            switch (sortField) {
                case 'name': return dir * a.recipeId.localeCompare(b.recipeId);
                case 'totalApplications': return dir * (a.totalApplications - b.totalApplications);
                case 'successCount': return dir * (a.successCount - b.successCount);
                case 'failureCount': return dir * (a.failureCount - b.failureCount);
                case 'successRate': return dir * (a.successRate - b.successRate);
                default: return 0;
            }
        });
        return sorted;
    }, [recipes, searchTerm, rateFilter, sortField, sortDir]);

    useLayoutEffect(() => {
        listRef.current?.resetAfterIndex(0, true);
    }, [isNarrow, rowHeight, filtered]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <CircularProgress sx={{ color: '#3b82f6' }} size={48} />
            </Box>
        );
    }

    if (error) {
        return <ErrorBanner message={error.message} onRetry={() => window.location.reload()} />;
    }

    const colHeaderSx = {
        px: 1.5,
        py: 2,
        cursor: 'pointer',
        userSelect: 'none' as const,
        '&:hover': { color: '#e2e8f0' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
    };

    const getItemSize = () => rowHeight;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Header stats */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box component="span" sx={{ px: 1.5, py: 0.5, bgcolor: 'rgba(168,85,247,0.1)', color: '#c084fc', borderRadius: '9999px', border: '1px solid rgba(168,85,247,0.2)', fontWeight: 500, fontSize: '0.875rem' }}>
                    {recipes?.length ?? 0} recipes
                </Box>
            </Box>

            {/* Search + Filter bar */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, bgcolor: '#1e2329', p: 2, borderRadius: '12px', border: '1px solid #1e293b' }}>
                <TextField
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    inputProps={{ 'aria-label': 'Search recipes' }}
                    size="small"
                    sx={{ ...inputSx, flex: 1, maxWidth: { sm: 400 } }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={20} style={{ color: '#64748b' }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.875rem', color: '#94a3b8' }}>{filtered.length} results</Typography>
                    <Select
                        value={rateFilter}
                        onChange={e => setRateFilter(e.target.value as RateFilter)}
                        inputProps={{ 'aria-label': 'Filter by success rate' }}
                        size="small"
                        sx={selectSx}
                        MenuProps={menuPropsSx}
                    >
                        <MenuItem value="all" sx={{ color: '#e2e8f0' }}>All Rates</MenuItem>
                        <MenuItem value="high" sx={{ color: '#e2e8f0' }}>● High (≥80%)</MenuItem>
                        <MenuItem value="medium" sx={{ color: '#e2e8f0' }}>◑ Medium (50–79%)</MenuItem>
                        <MenuItem value="low" sx={{ color: '#e2e8f0' }}>○ Low ({'<'}50%)</MenuItem>
                    </Select>
                </Box>
            </Box>

            {/* Virtualized table */}
            <Box sx={{ bgcolor: '#1e2329', borderRadius: '12px', border: '1px solid #1e293b', overflow: 'hidden' }}>
                {/* Table header */}
                <Box sx={{ bgcolor: '#15171a', borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ flex: 1, minWidth: 0, px: 3, py: 2, cursor: 'pointer', userSelect: 'none', '&:hover': { color: '#e2e8f0' } }} onClick={() => toggleSort('name')}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>Recipe {renderSortIcon('name')}</Box>
                        </Box>
                        <Box sx={{ width: 80, ...colHeaderSx, display: { xs: 'none', sm: 'flex' } }} onClick={() => toggleSort('totalApplications')}>
                            Total {renderSortIcon('totalApplications')}
                        </Box>
                        <Box sx={{ width: 80, ...colHeaderSx, display: { xs: 'none', sm: 'flex' } }} onClick={() => toggleSort('successCount')}>
                            Success {renderSortIcon('successCount')}
                        </Box>
                        <Box sx={{ width: 80, ...colHeaderSx, display: { xs: 'none', sm: 'flex' } }} onClick={() => toggleSort('failureCount')}>
                            Failed {renderSortIcon('failureCount')}
                        </Box>
                        <Box sx={{ width: 160, ...colHeaderSx }} onClick={() => toggleSort('successRate')}>
                            Success Rate {renderSortIcon('successRate')}
                        </Box>
                        <Box sx={{ width: 80, px: 1.5, py: 2, textAlign: 'right' }}>Actions</Box>
                    </Box>
                </Box>

                <div ref={listViewportRef} style={{ height: '70vh', overflow: 'hidden' }}>
                    {listWidth > 0 && listHeight > 0 && filtered.length > 0 && (
                        <VariableSizeList
                            ref={listRef}
                            height={listHeight}
                            width={listWidth}
                            itemCount={filtered.length}
                            itemSize={getItemSize}
                            overscanCount={5}
                        >
                            {({ index, style }) => {
                                const recipe = filtered[index];
                                const shortName = recipe.recipeId.split('.').pop() || recipe.recipeId;
                                const pendingCount = recipe.totalApplications - recipe.successCount - recipe.failureCount;

                                return (
                                    <div style={style}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', borderBottom: '1px solid rgba(30,41,59,0.5)', boxSizing: 'border-box', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }, transition: 'background 0.15s' }}>
                                            <Box sx={{ flex: 1, minWidth: 0, px: 3, py: 1.5 }}>
                                                <Box
                                                    component={Link}
                                                    to={`/recipes/${encodeURIComponent(recipe.recipeId)}`}
                                                    sx={{ fontWeight: 500, color: '#e2e8f0', textDecoration: 'none', '&:hover': { color: '#60a5fa' }, transition: 'color 0.15s' }}
                                                >
                                                    {shortName}
                                                </Box>
                                                <Typography sx={{ fontSize: '0.75rem', color: '#475569', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mt: 0.25 }}>
                                                    {recipe.recipeId}
                                                </Typography>
                                                {/* Mobile-only inline stats */}
                                                <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 1.5, mt: 0.5, fontSize: '0.75rem' }}>
                                                    <Typography component="span" sx={{ color: '#94a3b8', fontSize: 'inherit' }}>Total: <Box component="span" sx={{ color: '#f1f5f9', fontWeight: 700 }}>{recipe.totalApplications}</Box></Typography>
                                                    <Typography component="span" sx={{ color: '#4ade80', fontSize: 'inherit' }}>✓ {recipe.successCount}</Typography>
                                                    <Typography component="span" sx={{ color: '#f87171', fontSize: 'inherit' }}>✗ {recipe.failureCount}</Typography>
                                                    {pendingCount > 0 && <Typography component="span" sx={{ color: '#fbbf24', fontSize: 'inherit' }}>⏳ {pendingCount}</Typography>}
                                                </Box>
                                            </Box>
                                            <Box sx={{ width: 80, px: 1.5, py: 1.5, textAlign: 'center', color: '#cbd5e1', fontSize: '0.875rem', display: { xs: 'none', sm: 'block' } }}>
                                                {recipe.totalApplications}
                                            </Box>
                                            <Box sx={{ width: 80, px: 1.5, py: 1.5, textAlign: 'center', display: { xs: 'none', sm: 'block' } }}>
                                                {recipe.successCount > 0
                                                    ? <Typography component="span" sx={{ color: '#4ade80', fontSize: '0.875rem' }}>{recipe.successCount}</Typography>
                                                    : <Typography component="span" sx={{ color: '#475569', fontSize: '0.875rem' }}>0</Typography>}
                                            </Box>
                                            <Box sx={{ width: 80, px: 1.5, py: 1.5, textAlign: 'center', display: { xs: 'none', sm: 'block' } }}>
                                                {recipe.failureCount > 0
                                                    ? <Typography component="span" sx={{ color: '#f87171', fontSize: '0.875rem' }}>{recipe.failureCount}</Typography>
                                                    : <Typography component="span" sx={{ color: '#475569', fontSize: '0.875rem' }}>0</Typography>}
                                            </Box>
                                            <Box sx={{ width: 160, px: 1.5, py: 1.5, textAlign: 'center' }}>
                                                <SuccessRateBadge rate={recipe.successRate} />
                                            </Box>
                                            <Box sx={{ width: 80, px: 1.5, py: 1.5, textAlign: 'right' }}>
                                                <Box
                                                    component={Link}
                                                    to={`/recipes/${encodeURIComponent(recipe.recipeId)}`}
                                                    sx={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 0.5, '&:hover': { color: '#93c5fd' } }}
                                                >
                                                    <ChevronRight size={16} />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </div>
                                );
                            }}
                        </VariableSizeList>
                    )}
                </div>

                {filtered.length === 0 && (
                    <Box sx={{ p: 4, textAlign: 'center', color: '#64748b' }}>
                        No recipes found matching your criteria.
                    </Box>
                )}
            </Box>
        </Box>
    );
};
