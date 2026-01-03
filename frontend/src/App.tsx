import { useState } from 'react';
import axios from 'axios';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  LinearProgress,
  Chip,
  Grid,
  InputAdornment,
  AppBar,
  Toolbar,
  ToggleButton,
  ToggleButtonGroup,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Search as SearchIcon,

  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Shield as ShieldIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Link as LinkIcon,
  ReportProblem as ReportProblemIcon,
  Info as InfoIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon
} from '@mui/icons-material';


// --- Red/Black Theme Configuration ---
const cyberTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff1744', // Neon Red
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#d50000', // Deep Red
    },
    background: {
      default: '#000000', // Pure Black
      paper: '#0a0a0a',   // Very Dark Gray
    },
    success: {
      main: '#00e676', // Neon Green
    },
    error: {
      main: '#ff0000', // Pure Red
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Orbitron", sans-serif',
    h3: {
      fontWeight: 800,
      letterSpacing: '0.1rem',
      textTransform: 'uppercase',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '0.05rem',
    },
    button: {
      fontWeight: 700,
      letterSpacing: '0.1rem',
    }
  },
  shape: {
    borderRadius: 2, // Sharp corners
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#000000',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #1a0000 0%, #000000 70%)',
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '1px solid #ff1744',
          boxShadow: '0 0 10px rgba(255, 23, 68, 0.3)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(255, 23, 68, 0.1)',
            boxShadow: '0 0 20px rgba(255, 23, 68, 0.6)',
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #d50000 30%, #ff1744 90%)',
          border: 'none',
          color: 'white',
          '&:hover': {
            boxShadow: '0 0 25px rgba(255, 23, 68, 0.8)',
          }
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#050505',
          border: '1px solid #333',
        },
        elevation4: {
          border: '1px solid #ff1744',
          boxShadow: '0 0 15px rgba(255, 23, 68, 0.15)',
        }
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            '& fieldset': {
              borderColor: '#333',
            },
            '&:hover fieldset': {
              borderColor: '#ff1744',
              boxShadow: '0 0 10px rgba(255, 23, 68, 0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ff1744',
              boxShadow: '0 0 15px rgba(255, 23, 68, 0.4)',
            },
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          color: '#666',
          borderColor: '#333',
          borderRadius: 0,
          '&.Mui-selected': {
            color: '#fff',
            backgroundColor: 'rgba(255, 23, 68, 0.1)',
            borderColor: '#ff1744',
            '&:hover': {
              backgroundColor: 'rgba(255, 23, 68, 0.2)',
            }
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.1)',
          '&.MuiChip-colorPrimary': {
            border: '1px solid #ff1744',
            boxShadow: '0 0 8px rgba(255, 23, 68, 0.4)',
          }
        }
      }
    }
  },
});

// --- Types ---
interface ScanResult {
  text: string;
  scan_type: string;
  risk_score: number;
  verdict: string;
  reasons: string[];
}

// --- Constants ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://link-email-authenticator.onrender.com';

function App() {
  const [text, setText] = useState<string>('');
  const [scanType, setScanType] = useState<'url' | 'email'>('url');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [bulkResults, setBulkResults] = useState<ScanResult[]>([]); // New state for bulk
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isBulkMode, setIsBulkMode] = useState(false); // New state for mode toggle

  const handleAnalyze = async () => {
    if (!text) {
      setError("Please enter text to scan.");
      return;
    }

    setLoading(true);
    setResult(null);
    setBulkResults([]);
    setError(null);

    try {
      if (isBulkMode) {
        // Bulk Logic
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) {
          setError("Please enter at least one URL/Email.");
          setLoading(false);
          return;
        }

        const response = await axios.post(`${API_BASE_URL}/analyze/bulk`, {
          texts: lines,
          scan_type: scanType
        });
        setBulkResults(response.data);
      } else {
        // Single Logic
        const response = await axios.post(`${API_BASE_URL}/analyze`, {
          text: text,
          scan_type: scanType
        });
        setResult(response.data);
      }
    } catch (err) {
      console.error(err);
      setError("CONNECTION FAILED: SECURITY ENGINE UNREACHABLE.");
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newType: string | null,
  ) => {
    if (newType !== null) {
      setScanType(newType as 'url' | 'email');
      if (newType === 'email') {
        setIsBulkMode(false);
      }
      setText('');
      setResult(null);
      setBulkResults([]);
      setError(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
      setText(lines.join('\n'));
      setError(null);
    };
    reader.readAsText(file);
    // Reset value so same file can be selected again
    event.target.value = '';
  };

  const handleExportCSV = () => {
    if (bulkResults.length === 0) return;

    const headers = ['URL', 'Verdict', 'Risk Score', 'Reason'];
    const rows = bulkResults.map(r => [
      `"${r.text.replace(/"/g, '""')}"`, // Escape quotes
      r.verdict,
      `${r.risk_score}%`,
      `"${r.reasons[0]?.replace(/"/g, '""') || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `threat_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ThemeProvider theme={cyberTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        {/* Header */}
        <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #333', backdropFilter: 'blur(10px)' }}>
          <Toolbar>
            <LockIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28, filter: 'drop-shadow(0 0 5px #ff1744)' }} />
            <Typography variant="h5" color="inherit" sx={{ flexGrow: 1, fontFamily: 'Orbitron', letterSpacing: 2 }}>
              THREAT<span style={{ color: '#ff1744', textShadow: '0 0 10px #ff1744' }}>SCAN</span>
            </Typography>
            <Chip label="SYSTEM ACTIVE" color="primary" size="small" sx={{ fontWeight: 'bold' }} />
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ mt: 8, mb: 10 }}>

          {/* Main Search Section */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" gutterBottom sx={{
              background: 'linear-gradient(180deg, #ffffff 0%, #666 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 10px 20px rgba(0,0,0,0.5)'
            }}>
              GLOBAL THREAT INTELLIGENCE
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto', fontFamily: 'monospace' }}>
            // SELECT SCAN VECTOR & INITIATE ANALYSIS
            </Typography>
          </Box>

          {/* Instructions Section */}
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              mb: 4,
              bgcolor: 'rgba(0, 230, 118, 0.05)',
              borderColor: 'rgba(0, 230, 118, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderLeft: '4px solid #00e676'
            }}
          >
            <InfoIcon sx={{ color: '#00e676', fontSize: 28 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontFamily: 'Orbitron', color: '#00e676', letterSpacing: 1, mb: 0.5 }}>
                SCANNING INSTRUCTIONS
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#b0bec5' }}>
                {scanType === 'url'
                  ? "Enter the complete URL (including http/https). The engine checks for IP usage, open redirects, and known malicious patterns."
                  : "Paste the full email body. The AI analyzes sentiment, urgency, and keyword patterns to detect social engineering."
                }
              </Typography>
            </Box>
          </Paper>

          <Paper elevation={4} sx={{ p: 5, mb: 6 }}>

            {/* Toggle Switch */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <ToggleButtonGroup
                value={scanType}
                exclusive
                onChange={handleTypeChange}
                aria-label="scan type"
                sx={{ border: '1px solid #333' }}
              >
                <ToggleButton value="url" aria-label="scan url" sx={{ px: 4, py: 1.5 }}>
                  <LinkIcon sx={{ mr: 1 }} /> SCAN URL
                </ToggleButton>
                <ToggleButton value="email" aria-label="scan email" sx={{ px: 4, py: 1.5 }}>
                  <EmailIcon sx={{ mr: 1 }} /> SCAN EMAIL
                </ToggleButton>
              </ToggleButtonGroup>
              {scanType === 'url' && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={isBulkMode}
                      onChange={(e) => {
                        setIsBulkMode(e.target.checked);
                        setText(''); // Clear text when switching modes
                        setResult(null);
                        setBulkResults([]);
                        setError(null);
                      }}
                      color="secondary"
                    />
                  }
                  label={
                    <Typography sx={{ fontFamily: 'Orbitron', color: isBulkMode ? '#00e676' : '#666' }}>
                      {isBulkMode ? "BULK MODE ACTIVE" : "SINGLE SCAN MODE"}
                    </Typography>
                  }
                  sx={{ mt: 1 }}
                />
              )}
            </Box>

            {/* Instructions Section */}
            {isBulkMode && scanType === 'url' && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <input
                  accept=".csv, .txt"
                  style={{ display: 'none' }}
                  id="raised-button-file"
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="raised-button-file">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    sx={{ color: '#00e676', borderColor: '#00e676', '&:hover': { borderColor: '#00e676', bgcolor: 'rgba(0, 230, 118, 0.1)' } }}
                  >
                    UPLOAD CSV
                  </Button>
                </label>
              </Box>
            )}

            <Box component="form" noValidate autoComplete="off" onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }}>
              <Grid container spacing={2} alignItems="top">
                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline={isBulkMode || scanType === 'email'}
                    rows={isBulkMode ? 8 : (scanType === 'email' ? 6 : 1)}
                    placeholder={isBulkMode ? "https://site1.com\nhttps://site2.com\n..." : (scanType === 'url' ? "https://suspected-malware-site.com" : "Paste suspicious email body content here...")}
                    variant="outlined"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    InputProps={{
                      startAdornment: scanType === 'url' && !isBulkMode ? (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#ff1744' }} />
                        </InputAdornment>
                      ) : null,
                      sx: { fontSize: '1.1rem', fontFamily: 'monospace', color: '#fff' }
                    }}
                    sx={{
                      mb: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      input: { color: '#fff', fontFamily: 'monospace' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#333' },
                        '&:hover fieldset': { borderColor: '#ff1744' },
                        '&.Mui-focused fieldset': { borderColor: '#ff1744' }
                      }
                    }}
                  />
                </Grid>
                <Grid size={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleAnalyze}
                    disabled={loading || !text}
                    sx={{ height: 56, mt: 1 }}
                  >
                    {loading ? 'ANALYZING...' : 'INITIATE ANALYSIS'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {loading && (
            <Box sx={{ width: '100%', mb: 4 }}>
              <LinearProgress sx={{ height: 4, bgcolor: '#333', '& .MuiLinearProgress-bar': { bgcolor: '#ff1744' } }} />
              <Typography variant="caption" sx={{ color: '#ff1744', display: 'block', textAlign: 'center', mt: 1, fontFamily: 'monospace' }}>
                [Scanning Protocols...] [Extracting Features...] [Running ML Model...]
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" variant="outlined" sx={{ mb: 4, bgcolor: 'rgba(255, 23, 68, 0.1)', color: '#ff1744', border: '1px solid #ff1744' }}>
              {error}
            </Alert>
          )}

          {/* Bulk Results Section */}
          {isBulkMode && bulkResults.length > 0 && (
            <>
              <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0,0,0,0.5)', border: '1px solid #333' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#111' }}>
                      <TableCell sx={{ color: '#888', fontFamily: 'Orbitron' }}>INPUT</TableCell>
                      <TableCell sx={{ color: '#888', fontFamily: 'Orbitron' }}>VERDICT</TableCell>
                      <TableCell sx={{ color: '#888', fontFamily: 'Orbitron' }}>RISK</TableCell>
                      <TableCell sx={{ color: '#888', fontFamily: 'Orbitron' }}>DETAILS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bulkResults.map((row, index) => (
                      <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell component="th" scope="row" sx={{ color: '#fff', fontFamily: 'monospace', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row.text}
                        </TableCell>
                        <TableCell>
                          <Box sx={{
                            color: row.verdict === 'Safe' ? '#00e676' : '#ff1744',
                            border: `1px solid ${row.verdict === 'Safe' ? '#00e676' : '#ff1744'}`,
                            px: 1, py: 0.5, borderRadius: 1, display: 'inline-block', fontFamily: 'Orbitron', fontSize: '0.7rem'
                          }}>
                            {row.verdict.toUpperCase()}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: row.risk_score < 50 ? '#00e676' : '#ff1744', fontWeight: 'bold' }}>
                          {row.risk_score}%
                        </TableCell>
                        <TableCell sx={{ color: '#ccc', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {row.reasons[0] || "No threats found."}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportCSV}
                  sx={{
                    bgcolor: '#1a1a1a',
                    color: '#fff',
                    border: '1px solid #333',
                    '&:hover': { bgcolor: '#333' }
                  }}
                >
                  EXPORT CSV REPORT
                </Button>
              </Box>
            </> // End fragment
          )}

          {/* Single Result Section */}
          {!isBulkMode && result && (
            <>
              {result.verdict === 'Invalid' ? (
                <Alert
                  severity="error"
                  variant="filled"
                  sx={{
                    width: '100%',
                    p: 3,
                    mb: 4,
                    bgcolor: 'rgba(211, 47, 47, 0.2)',
                    color: '#ff5252',
                    border: '1px solid #ff5252',
                    backdropFilter: 'blur(10px)'
                  }}
                  icon={<ReportProblemIcon sx={{ fontSize: 40, color: '#ff5252' }} />}
                >
                  <Typography variant="h5" sx={{ fontFamily: 'Orbitron', mb: 1, letterSpacing: 1 }}>
                    INVALID INPUT DETECTED
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {result.reasons[0]}
                  </Typography>
                </Alert>
              ) : (
                <Paper
                  elevation={10}
                  sx={{
                    p: 0,
                    overflow: 'hidden',
                    border: 1,
                    borderColor: result.verdict === 'Safe' ? '#00e676' : '#ff1744',
                    boxShadow: result.verdict === 'Safe' ? '0 0 30px rgba(0, 230, 118, 0.2)' : '0 0 50px rgba(255, 23, 68, 0.3)'
                  }}
                >
                  <Box sx={{
                    p: 3,
                    bgcolor: result.verdict === 'Safe' ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 23, 68, 0.15)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: `1px solid ${result.verdict === 'Safe' ? '#00e676' : '#ff1744'}`
                  }}>
                    {result.verdict === 'Safe' ?
                      <ShieldIcon sx={{ mr: 2, fontSize: 40, color: '#00e676', filter: 'drop-shadow(0 0 5px #00e676)' }} /> :
                      <WarningIcon sx={{ mr: 2, fontSize: 40, color: '#ff1744', filter: 'drop-shadow(0 0 10px #ff1744)' }} />
                    }
                    <Typography variant="h4" sx={{ fontFamily: 'Orbitron', letterSpacing: 3, textShadow: result.verdict === 'Safe' ? '0 0 10px #00e676' : '0 0 15px #ff1744' }}>
                      {result.verdict === 'Safe' ? 'SECURE' : 'THREAT DETECTED'}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 5 }}>
                    <Grid container spacing={6}>

                      {/* Score Gauge */}
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 2 }}>THREAT PROBABILITY</Typography>
                          <Typography variant="h2" sx={{
                            color: result.verdict === 'Safe' ? '#00e676' : '#ff1744',
                            fontWeight: 'bold',
                            textShadow: result.verdict === 'Safe' ? '0 0 20px rgba(0,230,118,0.5)' : '0 0 30px rgba(255,23,68,0.6)'
                          }}>
                            {result.risk_score}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={result.risk_score}
                            sx={{
                              mt: 2,
                              height: 8,
                              borderRadius: 0,
                              bgcolor: '#111',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: result.verdict === 'Safe' ? '#00e676' : '#ff1744',
                                boxShadow: result.verdict === 'Safe' ? '0 0 10px #00e676' : '0 0 15px #ff1744'
                              }
                            }}
                          />
                        </Box>

                        <Box sx={{ mt: 5 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontFamily: 'monospace' }}>TARGET ARTIFACT</Typography>
                          <Box sx={{
                            p: 2,
                            bgcolor: '#0a0a0a',
                            border: '1px solid #333',
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            wordBreak: 'break-all',
                            color: result.verdict === 'Safe' ? '#00e676' : '#ff1744',
                            maxHeight: '100px',
                            overflowY: 'auto'
                          }}>
                            {result.text}
                          </Box>
                        </Box>
                      </Grid>

                      {/* Threat Analysis Details */}
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 2, display: 'block', mb: 2 }}>
                          THREAT ANALYSIS REPORT
                        </Typography>

                        <Paper variant="outlined" sx={{ bgcolor: 'rgba(255,255,255,0.02)', borderColor: '#333' }}>
                          <List dense>
                            {result.reasons && result.reasons.length > 0 ? (
                              result.reasons.map((reason, index) => (
                                <div key={index}>
                                  <ListItem>
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                      {result.verdict === 'Safe' ?
                                        <CheckCircleIcon sx={{ color: '#00e676', fontSize: 20 }} /> :
                                        <ReportProblemIcon sx={{ color: '#ff1744', fontSize: 20 }} />
                                      }
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={reason}
                                      primaryTypographyProps={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.9rem',
                                        color: result.verdict === 'Safe' ? '#eee' : '#ffcdd2'
                                      }}
                                    />
                                  </ListItem>
                                  {index < result.reasons.length - 1 && <Divider component="li" sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}
                                </div>
                              ))
                            ) : (
                              <ListItem>
                                <ListItemIcon>
                                  <CheckCircleIcon color="success" />
                                </ListItemIcon>
                                <ListItemText primary="No anomalies detected." />
                              </ListItem>
                            )}
                          </List>
                        </Paper>

                        <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Chip label={result.scan_type.toUpperCase()} size="small" variant="outlined" sx={{ borderColor: '#333', color: '#666', borderRadius: 0 }} />
                          <Chip label="ML ENGINE V2" size="small" variant="outlined" sx={{ borderColor: '#333', color: '#666', borderRadius: 0 }} />
                        </Box>
                      </Grid>

                    </Grid>
                  </Box>
                </Paper>
              )}
            </>
          )}

        </Container>

        {/* Footer */}
        <Box sx={{ borderTop: '1px solid #333', bgcolor: '#050505', py: 2, mt: 'auto' }}>
          <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontFamily: 'Orbitron', color: '#fff', letterSpacing: 2, mb: 1 }}>
              MAIL & LINK AUTHENTICATOR
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary', mb: 2 }}>
              Powered by Advanced ML Engine | Secure Analysis | Private
            </Typography>
            <Typography variant="caption" sx={{ color: '#444' }}>
              © {new Date().getFullYear()} Mohammed Mutee. All Rights Reserved.
            </Typography>
          </Container>
        </Box>
      </Box>

    </ThemeProvider >
  );
}

export default App;
