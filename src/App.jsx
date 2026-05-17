import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Grid, Card, CardContent, Typography, 
  Chip, Button, IconButton, Tabs, Tab, Snackbar, Alert, Badge,
  AppBar, Toolbar, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider,
  useTheme, useMediaQuery, Fade, CircularProgress, Tooltip, Avatar, TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Slider, Switch, FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress
} from '@mui/material';
import { 
  TrendingUp, Timeline, ReportProblem, Settings as SettingsIcon, Dashboard as DashboardIcon, 
  Inventory as InventoryIcon, BarChart as BarChartIcon, NotificationsActive, LocalDining, AttachMoney, 
  AccessTime as AccessTimeIcon, WarningAmber, CheckCircle, Close, Psychology as BrainIcon,
  Sensors as SensorsIcon, LocalShipping as RestockIcon, Schema as SchemaIcon, Add as AddIcon,
  Search as SearchIcon, CloudDownload as DownloadIcon, Refresh as RefreshIcon, Help as HelpIcon,
  History as HistoryIcon, Layers as LayersIcon, Memory as HardwareIcon, Hub as HubIcon
} from '@mui/icons-material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, ReferenceArea, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import UserCheckout from './UserCheckout';

const drawerWidth = 260;

const CATEGORY_IMAGES = {
  'Fruits': 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=300',
  'Vegetables': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=300',
  'Dairy': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=300',
  'Meat': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=300',
  'Frozen Food': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=300',
  'Drinks': 'https://images.unsplash.com/photo-1527960656366-ee2a999e32e6?auto=format&fit=crop&q=80&w=300',
  'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=300'
};

export default function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [activeView, setActiveView] = useState('Dashboard');
  const [viewMode, setViewMode] = useState('Operations'); // 'Operations' or 'Executive'
  
  const [kpi, setKpi] = useState({ liveRevenue: 0, totalTransactions: 0, couponsAccepted: 0, expiringProducts: 0, lowStockAlerts: 0, wasteRiskLevel: 'Low' });
  const [recommendations, setRecommendations] = useState([]);
  
  const [inventoryList, setInventoryList] = useState([]);
  const [invTotal, setInvTotal] = useState(0);
  const [invSearch, setInvSearch] = useState('');
  const [invCategory, setInvCategory] = useState('All');
  const [invPage, setInvPage] = useState(1);
  const [invSortBy, setInvSortBy] = useState('name');
  const [invSortOrder, setInvSortOrder] = useState('asc');
  const [invLoading, setInvLoading] = useState(false);
  
  const [analytics, setAnalytics] = useState(null);
  const [sensorData, setSensorData] = useState({ temperature: 8.4, humidity: 74.0, gas_ppm: 510.0, ph: 5.1 });
  const [sensorHistory, setSensorHistory] = useState([]);
  const [mlPredictions, setMlPredictions] = useState(null);
  
  const [traceModal, setTraceModal] = useState({ open: false, data: null, loading: false });
  const [auditLogs, setAuditLogs] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Fruits', price: '', quantity: '100', expiry_date: '', supplier: 'Apex Distributors', image_emoji: '📦' });
  
  const [restockSafety, setRestockSafety] = useState(40);
  const [restockLeadTime, setRestockLeadTime] = useState(3);
  
  const [autoApplyDiscount, setAutoApplyDiscount] = useState(true);
  const [autoOrderRestock, setAutoOrderRestock] = useState(true);
  const [tempThreshold, setTempThreshold] = useState(10.0);
  
  const fetchGlobalMetrics = async () => {
    try {
      const kpiRes = await fetch('http://localhost:8000/api/kpi').then(res => res.json());
      if (kpiRes) setKpi(kpiRes);
      
      const recRes = await fetch('http://localhost:8000/api/ai-decisions').then(res => res.json());
      if (recRes) setRecommendations(recRes);
    } catch (err) {
      console.error("Failed to fetch global metrics", err);
    }
  };

  const fetchInventory = async () => {
    setInvLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/products?page=${invPage}&limit=12&search=${invSearch}&category=${invCategory}&sort_by=${invSortBy}&sort_order=${invSortOrder}`).then(r => r.json());
      if (res) {
        setInventoryList(res.products || []);
        setInvTotal(res.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch inventory", err);
    } finally {
      setInvLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/analytics').then(r => r.json());
      if (res) setAnalytics(res);
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    }
  };

  const fetchSensors = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/sensor-data').then(r => r.json());
      if (res) {
        setSensorData(res);
        setSensorHistory(prev => {
          const next = [...prev, { time: new Date().toLocaleTimeString().slice(0, 8), temp: res.temperature, gas: res.gas_ppm }];
          if (next.length > 20) next.shift();
          return next;
        });
      }
    } catch (err) {
      console.error("Failed to fetch sensors", err);
    }
  };

  const fetchMLPredictions = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/ml-predictions').then(r => r.json());
      if (res) setMlPredictions(res);
    } catch (err) {
      console.error("Failed to fetch ML", err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/xai/audit-log').then(r => r.json());
      if (res) setAuditLogs(res.audit_log || []);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    }
  };

  useEffect(() => {
    fetchGlobalMetrics();
    fetchInventory();
    fetchAnalytics();
    fetchSensors();
    fetchMLPredictions();
    fetchAuditLogs();

    const interval = setInterval(() => {
      fetchGlobalMetrics();
      fetchSensors();
      fetchMLPredictions();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [invPage, invCategory, invSortBy, invSortOrder]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleToastClose = () => setToast({ ...toast, open: false });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
          quantity: parseInt(newProduct.quantity)
        })
      }).then(r => r.json());
      
      if (res.success) {
        setToast({ open: true, message: `Product '${newProduct.name}' added successfully!`, severity: 'success' });
        setAddModalOpen(false);
        setNewProduct({ name: '', category: 'Fruits', price: '', quantity: '100', expiry_date: '', supplier: 'Apex Distributors', image_emoji: '📦' });
        fetchInventory();
        fetchGlobalMetrics();
      } else {
        setToast({ open: true, message: res.detail || "Product already exists", severity: 'error' });
      }
    } catch (err) {
      setToast({ open: true, message: "Error adding product", severity: 'error' });
    }
  };

  const handleUpdateProduct = async (id, field, value) => {
    try {
      const res = await fetch(`http://localhost:8000/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      }).then(r => r.json());

      if (res.success) {
        setToast({ open: true, message: `Updated product ${field}!`, severity: 'success' });
        fetchInventory();
        fetchGlobalMetrics();
      }
    } catch (err) {
      setToast({ open: true, message: "Failed to update product", severity: 'error' });
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/products/${id}`, {
        method: 'DELETE'
      }).then(r => r.json());

      if (res.success) {
        setToast({ open: true, message: "Product deleted successfully!", severity: 'info' });
        fetchInventory();
        fetchGlobalMetrics();
      }
    } catch (err) {
      setToast({ open: true, message: "Failed to delete product", severity: 'error' });
    }
  };

  const launchTraceabilityReport = async (product) => {
    setTraceModal({ open: true, data: null, loading: true });
    try {
      const days = product.expiry_date ? Math.max(0, Math.ceil((new Date(product.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))) : 15;
      const res = await fetch('http://localhost:8000/api/xai/traceability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: product.name,
          days_to_expiry: days,
          stock: product.quantity,
          weekly_sales: randomIntFromId(product.id, 10, 95),
          spoilage_prob: Math.round(100 - product.health_score),
          freshness: product.freshness_score,
          temp: sensorData.temperature,
          humidity: sensorData.humidity,
          gas_ppm: sensorData.gas_ppm,
          ph: sensorData.ph
        })
      }).then(r => r.json());
      
      setTraceModal({ open: true, data: res, loading: false });
    } catch (err) {
      console.error("XAI retrieval failed", err);
      setTraceModal({ open: false, data: null, loading: false });
      setToast({ open: true, message: "XAI Server unreachable. Reconnect and try again.", severity: 'error' });
    }
  };

  const randomIntFromId = (id, min, max) => {
    const x = Math.sin(id) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  };

  const handleYogurtDemo = async () => {
    setTraceModal({ open: true, data: null, loading: true });
    try {
      const res = await fetch('http://localhost:8000/api/xai/demo').then(r => r.json());
      setTraceModal({ open: true, data: res, loading: false });
    } catch (err) {
      console.error("Demo failed", err);
      setTraceModal({ open: false, data: null, loading: false });
    }
  };

  const NAVIGATION_ITEMS = [
    { text: 'Dashboard', icon: <DashboardIcon />, view: 'Dashboard' },
    { text: 'Inventory Management', icon: <InventoryIcon />, view: 'Inventory' },
    { text: 'AI Autonomous Feed', icon: <NotificationsActive />, view: 'AIDecisions' },
    { text: 'Product Expiry Timeline', icon: <AccessTimeIcon />, view: 'ProductExpiry' },
    { text: 'Restocking Intelligence', icon: <RestockIcon />, view: 'Restocking' },
    { text: 'IoT Sensor Stream', icon: <SensorsIcon />, view: 'SensorMonitor' },
    { text: 'System Settings', icon: <SettingsIcon />, view: 'Settings' },
    { text: 'User Checkout Kiosk', icon: <LocalDining />, view: 'Checkout' }
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ my: 2 }}>
        <LocalDining sx={{ color: theme.palette.primary.main, mr: 2, fontSize: 32 }} />
        <Typography variant="h6" noWrap component="div" fontWeight="bold">
          QWIC Supermarket
        </Typography>
      </Toolbar>
      <Divider sx={{ opacity: 0.1 }} />
      <List sx={{ px: 1, flexGrow: 1, overflowY: 'auto' }}>
        {NAVIGATION_ITEMS.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              onClick={() => {
                setActiveView(item.view);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{ 
                borderRadius: 2, 
                backgroundColor: activeView === item.view ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                color: activeView === item.view ? theme.palette.primary.light : 'text.secondary',
                '&:hover': {
                  backgroundColor: activeView === item.view ? 'rgba(124, 58, 237, 0.25)' : 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              <ListItemIcon sx={{ color: activeView === item.view ? theme.palette.primary.light : 'text.secondary', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: activeView === item.view ? 600 : 400, fontSize: 14 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ opacity: 0.1 }} />
      <Box sx={{ p: 2 }}>
        <Card sx={{ bgcolor: 'rgba(7, 16, 40, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)' }}>
          <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>AI CORE</Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981', animation: 'pulse 1.5s infinite' }} />
                  <Typography sx={{ fontSize: 10, fontWeight: 800, color: '#10B981' }}>ACTIVE</Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>ML PIPELINE</Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981', animation: 'pulse 1.5s infinite' }} />
                  <Typography sx={{ fontSize: 10, fontWeight: 800, color: '#10B981' }}>HEALTHY</Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>SENSOR GRID</Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981', animation: 'pulse 1.5s infinite' }} />
                  <Typography sx={{ fontSize: 10, fontWeight: 800, color: '#10B981' }}>ONLINE</Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: 'background.paper', borderRight: '1px solid rgba(255,255,255,0.05)' },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', mb: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
          <Toolbar sx={{ justifyContent: 'space-between', px: 2 }}>
            <Box display="flex" alignItems="center">
              {isMobile && (
                <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
                  <DashboardIcon />
                </IconButton>
              )}
              <Box>
                <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.5px' }}>
                  {activeView === 'Checkout' ? 'Self-Service Checkout' : `Command Center - ${activeView}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {activeView === 'Checkout' ? 'Simulate customer point-of-sale deals live' : 'AI Supermarket Operating System (AI-OS) v3.0'}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Tooltip title="Run Explanatory Yogurt Demo">
                <Button variant="outlined" size="small" color="primary" onClick={handleYogurtDemo} startIcon={<HelpIcon />}>
                  Yogurt demo
                </Button>
              </Tooltip>
              <Badge badgeContent={recommendations.filter(r => r.status === 'applied' || r.status === 'replenished').length} color="success">
                <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: 'success.main', width: 40, height: 40 }}>
                  <NotificationsActive />
                </Avatar>
              </Badge>
            </Box>
          </Toolbar>
        </AppBar>

        {activeView === 'Checkout' && <UserCheckout />}

        {activeView === 'Dashboard' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* VIEW MODE TOGGLE & HEADER ACTIONS (Item 17) */}
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ bgcolor: '#111827', p: 1.5, borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
              <Box display="flex" gap={1}>
                <Button 
                  variant={viewMode === 'Operations' ? 'contained' : 'outlined'} 
                  size="small" 
                  onClick={() => setViewMode('Operations')}
                  sx={{ 
                    bgcolor: viewMode === 'Operations' ? '#8B5CF6' : 'transparent',
                    borderColor: '#8B5CF6',
                    color: '#fff',
                    '&:hover': { bgcolor: viewMode === 'Operations' ? '#7C3AED' : 'rgba(139, 92, 246, 0.1)' }
                  }}
                >
                  ⚙️ Operations Console
                </Button>
                <Button 
                  variant={viewMode === 'Executive' ? 'contained' : 'outlined'} 
                  size="small" 
                  onClick={() => setViewMode('Executive')}
                  sx={{ 
                    bgcolor: viewMode === 'Executive' ? '#06B6D4' : 'transparent',
                    borderColor: '#06B6D4',
                    color: '#fff',
                    '&:hover': { bgcolor: viewMode === 'Executive' ? '#0891B2' : 'rgba(6, 182, 212, 0.1)' }
                  }}
                >
                  💼 Executive Hub
                </Button>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981', animation: 'pulse 1.5s infinite' }} />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 'bold' }}>
                  REAL-TIME SIMULATION ACTIVE • REFRESH 5S
                </Typography>
              </Box>
            </Box>

            {/* HERO METRICS ROW (Item 3) */}
            <Grid container spacing={2}>
              {[
                { 
                  title: 'Live Revenue', 
                  value: `₹${kpi.liveRevenue.toLocaleString()}`, 
                  sub: '+12.4% vs forecast', 
                  icon: <AttachMoney sx={{ color: '#8B5CF6' }} />,
                  trend: 'up', 
                  conf: '94%',
                  sparkColor: '#8B5CF6',
                  data: [100, 110, 105, 120, 130, 124] 
                },
                { 
                  title: 'AI Waste Saved', 
                  value: `₹${analytics?.wasteMetrics?.totalSaved_INR?.toLocaleString() || '12,450'}`, 
                  sub: `${analytics?.wasteMetrics?.savedWeight_kg || '240'}kg diverted`, 
                  icon: <NotificationsActive sx={{ color: '#06B6D4' }} />, 
                  trend: 'up', 
                  conf: '97%',
                  sparkColor: '#06B6D4',
                  data: [80, 95, 110, 120, 135, 140] 
                },
                { 
                  title: 'Active AI Decisions', 
                  value: recommendations.length, 
                  sub: '100% autonomous', 
                  icon: <BrainIcon sx={{ color: '#10B981' }} />, 
                  trend: 'up', 
                  conf: '99%',
                  sparkColor: '#10B981',
                  data: [10, 14, 18, 22, 24, 28]
                },
                { 
                  title: 'Inventory Health', 
                  value: `${kpi.wasteRiskLevel === 'High' ? '82.4%' : '94.8%'}`, 
                  sub: `${kpi.expiringProducts} near expiry items`, 
                  icon: <InventoryIcon sx={{ color: kpi.wasteRiskLevel === 'High' ? '#EF4444' : '#10B981' }} />, 
                  trend: kpi.wasteRiskLevel === 'High' ? 'down' : 'up',
                  conf: '96%',
                  sparkColor: kpi.wasteRiskLevel === 'High' ? '#EF4444' : '#10B981',
                  data: [96, 95, 94, 93, 94, 95]
                },
                { 
                  title: 'Store Traffic', 
                  value: `${kpi.occupancyRate}%`, 
                  sub: 'Capacity optimization', 
                  icon: <Timeline sx={{ color: '#F59E0B' }} />, 
                  trend: 'up', 
                  conf: '93%',
                  sparkColor: '#F59E0B',
                  data: [65, 70, 75, 80, 82, 85]
                },
                { 
                  title: 'Prediction Accuracy', 
                  value: '94.2%', 
                  sub: 'Random Forest Model', 
                  icon: <HardwareIcon sx={{ color: '#06B6D4' }} />, 
                  trend: 'stable', 
                  conf: '100%',
                  sparkColor: '#06B6D4',
                  data: [94, 94, 94, 94, 94, 94]
                }
              ].map((card, idx) => (
                <Grid item xs={12} sm={6} md={4} lg={2} key={idx}>
                  <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {card.title}
                        </Typography>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.03)', width: 28, height: 28 }}>
                          {card.icon}
                        </Avatar>
                      </Box>
                      <Box display="flex" alignItems="baseline" gap={1}>
                        <Typography variant="h6" fontWeight="950" sx={{ letterSpacing: '-0.5px' }}>{card.value}</Typography>
                        <Typography sx={{ fontSize: 10, fontWeight: 800, color: card.trend === 'up' ? '#10B981' : card.trend === 'down' ? '#EF4444' : 'text.secondary' }}>
                          {card.trend === 'up' ? '↑' : card.trend === 'down' ? '↓' : '•'}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary', display: 'block', mt: 0.5 }}>
                        {card.sub}
                      </Typography>
                      
                      {/* Mini Sparkline Graph */}
                      <Box sx={{ height: 20, mt: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={card.data.map((v, i) => ({ i, v }))}>
                            <Area type="monotone" dataKey="v" stroke={card.sparkColor} fill={card.sparkColor} fillOpacity={0.08} strokeWidth={1.5} dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>

                      {/* AI Confidence badge */}
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={1} sx={{ pt: 0.5, borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                        <Typography sx={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>CONFIDENCE</Typography>
                        <Typography sx={{ fontSize: 8, fontWeight: 900, color: '#06B6D4' }}>{card.conf}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* OPERATIONS VIEW CONTENT (Item 17) */}
            {viewMode === 'Operations' && (
              <Grid container spacing={3}>
                
                {/* Left Side: Dense Real-time control systems (8/12 grid) */}
                <Grid item xs={12} lg={8} container spacing={3}>
                  
                  {/* Digital Twin (Item 6) */}
                  <Grid item xs={12}>
                    <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#06B6D4', animation: 'pulse 1.5s infinite' }} />
                            <Typography variant="h6" fontWeight="bold">Digital Store Twin (Real-Time Shelf Activity & Hotspots)</Typography>
                          </Box>
                          <Chip label="Customer Flow: Simulated Live" size="small" sx={{ bgcolor: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4', border: '1px solid rgba(6, 182, 212, 0.2)', fontSize: 10 }} />
                        </Box>
                        
                        {/* Simulation twin floorplan */}
                        <Box sx={{ bgcolor: '#071028', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 3, p: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 2, minHeight: 180 }}>
                          {[
                            { zone: 'A1 - FRESH PRODUCE', health: '94%', color: '#10B981', items: 'Fruits & Vegetables', status: 'Healthy Zone', pulse: true, coords: [{x: '20%', y: '40%'}, {x: '45%', y: '60%'}] },
                            { zone: 'B2 - COLD ROOM', health: '82%', color: '#EF4444', items: 'Dairy & Meats', status: 'Temp Drift Alert', pulse: true, coords: [{x: '80%', y: '30%'}] },
                            { zone: 'C3 - FROZEN DECK', health: '91%', color: '#F59E0B', items: 'Frozen Foods', status: 'Anomaly Spike', pulse: true, coords: [{x: '15%', y: '70%'}, {x: '75%', y: '80%'}] },
                            { zone: 'D4 - BEVERAGE BLOCK', health: '97%', color: '#10B981', items: 'Drinks & Soda', status: 'Optimal Shelf', pulse: false, coords: [] }
                          ].map((shelf, i) => (
                            <Box key={i} sx={{ position: 'relative', bgcolor: 'rgba(255,255,255,0.01)', border: `1px solid rgba(255,255,255,0.04)`, borderTop: `4px solid ${shelf.color}`, borderRadius: 2, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 120 }}>
                              <Box>
                                <Typography sx={{ fontSize: 10, fontWeight: 900, color: 'text.secondary' }}>{shelf.zone}</Typography>
                                <Typography sx={{ fontSize: 12, fontWeight: 800, mt: 0.5 }}>{shelf.items}</Typography>
                              </Box>
                              
                              {/* Customer simulated dots */}
                              {shelf.coords.map((c, idx) => (
                                <Box key={idx} sx={{ position: 'absolute', left: c.x, top: c.y, width: 8, height: 8, borderRadius: '50%', bgcolor: '#06B6D4', animation: 'pulse 1.5s infinite', boxShadow: '0 0 8px #06B6D4' }} />
                              ))}

                              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                <Typography sx={{ fontSize: 9, fontWeight: 700, color: shelf.color }}>{shelf.status}</Typography>
                                <Typography sx={{ fontSize: 11, fontWeight: 950, color: '#fff' }}>{shelf.health}</Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Real AI Sales Activity Timeline (Item 4) */}
                  <Grid item xs={12}>
                    <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="h6" fontWeight="bold">Real-Time Sales Activity Timeline (24-Hour Operations)</Typography>
                          <Box display="flex" gap={1}>
                            <Chip size="small" label="Live Current Hour" sx={{ bgcolor: '#8B5CF6', color: '#fff', fontSize: 9 }} />
                            <Chip size="small" label="AI Predicted Spikes" sx={{ bgcolor: '#06B6D4', color: '#fff', fontSize: 9 }} />
                          </Box>
                        </Box>

                        <Grid container spacing={1}>
                          {Array.from({ length: 12 }).map((_, idx) => {
                            const hr = (idx * 2 + 8) % 24;
                            const isCurrent = hr === 20; // Simulated current time is 8 PM (20:00)
                            const intensity = Math.round(30 + Math.sin(idx / 2) * 45 + (isCurrent ? 20 : Math.random() * 10));
                            const predicted = Math.round(intensity * 1.1 + Math.sin(idx) * 8);
                            const risk = intensity > 80 ? 'Restock Needed' : intensity > 50 ? 'Medium Shelf Risk' : 'Optimal';
                            const blockColor = intensity > 75 ? 'rgba(239, 68, 68, 0.15)' : intensity > 45 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)';
                            const borderGlow = intensity > 75 ? '1px solid #ef4444' : intensity > 45 ? '1px solid #f59e0b' : '1px solid #10b981';
                            
                            return (
                              <Grid item xs={6} sm={3} md={2} key={idx}>
                                <Tooltip title={
                                  <Box sx={{ p: 1 }}>
                                    <Typography variant="caption" display="block">Hour: <strong>{hr}:00</strong></Typography>
                                    <Typography variant="caption" display="block">Intensity: <strong>{intensity}%</strong></Typography>
                                    <Typography variant="caption" display="block">AI Forecasted: <strong>{predicted}%</strong></Typography>
                                    <Typography variant="caption" display="block">Status: <strong>{risk}</strong></Typography>
                                  </Box>
                                } arrow>
                                  <Box sx={{ 
                                    bgcolor: blockColor, 
                                    border: isCurrent ? '2px solid #8B5CF6' : borderGlow, 
                                    py: 1.5, px: 2, 
                                    textAlign: 'center', 
                                    borderRadius: 3, 
                                    position: 'relative',
                                    cursor: 'pointer',
                                    boxShadow: isCurrent ? '0 0 12px rgba(139, 92, 246, 0.4)' : 'none',
                                    transition: 'all 0.2s',
                                    '&:hover': { transform: 'translateY(-2px)' }
                                  }}>
                                    {isCurrent && (
                                      <Box sx={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: '50%', bgcolor: '#8B5CF6', animation: 'pulse 1.5s infinite' }} />
                                    )}
                                    <Typography sx={{ fontSize: 12, fontWeight: 900, color: '#fff' }}>{hr}:00</Typography>
                                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: 'text.secondary', mt: 0.5 }}>
                                      Sales: {intensity > 70 ? 'High' : intensity > 40 ? 'Moderate' : 'Low'}
                                    </Typography>
                                    <Typography sx={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.4)', mt: 0.5 }}>
                                      Pred: {predicted}%
                                    </Typography>
                                  </Box>
                                </Tooltip>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Dynamic Operations Charts (Item 8) */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="h6" fontWeight="bold">Inventory Forecast & Depletion Curve</Typography>
                          <Chip label="AI Forecast Overlay" size="small" variant="outlined" color="primary" sx={{ fontSize: 9, height: 18 }} />
                        </Box>
                        <Box height={200}>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                              { day: 'Day 1', actual: 480, forecast: 480, threshold: 120 },
                              { day: 'Day 2', actual: 390, forecast: 410, threshold: 120 },
                              { day: 'Day 3', actual: 290, forecast: 310, threshold: 120 },
                              { day: 'Day 4', actual: 210, forecast: 220, threshold: 120 },
                              { day: 'Day 5', actual: null, forecast: 140, threshold: 120 },
                              { day: 'Day 6', actual: null, forecast: 80, threshold: 120 }
                            ]}>
                              <defs>
                                <linearGradient id="colorActInv" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                              <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" />
                              <YAxis stroke="rgba(255,255,255,0.4)" />
                              <RechartsTooltip />
                              <Area type="monotone" dataKey="actual" name="Actual Shelf Quantity" stroke="#8B5CF6" strokeWidth={3} fill="url(#colorActInv)" />
                              <Line type="monotone" dataKey="forecast" name="Predicted Depletion" stroke="#06B6D4" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                              <Line type="monotone" dataKey="threshold" name="PO Reorder Threshold" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="h6" fontWeight="bold">Waste Analytics & Spoilage Prevention</Typography>
                          <Chip label="INR Impact" size="small" variant="outlined" color="secondary" sx={{ fontSize: 9, height: 18 }} />
                        </Box>
                        <Box height={200}>
                          {analytics ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={analytics.salesTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" />
                                <YAxis stroke="rgba(255,255,255,0.4)" />
                                <RechartsTooltip />
                                <Area type="monotone" dataKey="actual" name="Prevented Loss (₹)" stroke="#10B981" fillOpacity={0.1} fill="#10B981" strokeWidth={3} />
                              </AreaChart>
                            </ResponsiveContainer>
                          ) : <CircularProgress />}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* IoT Sensors (Item 9) */}
                  <Grid item xs={12}>
                    <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold" mb={2}>Live Cold Room & Shelf IoT Telemetry Stream</Typography>
                        
                        <Grid container spacing={2}>
                          {[
                            { name: 'Cold Room Temperature', val: `${sensorData.temperature}°C`, color: '#8B5CF6', limit: '2°C - 6°C Bounds', pct: (sensorData.temperature/15)*100 },
                            { name: 'Ambient Air Humidity', val: `${sensorData.humidity}%`, color: '#10B981', limit: '55% - 65% Optimal', pct: sensorData.humidity },
                            { name: 'Organic Spoilage Gas', val: `${sensorData.gas_ppm} ppm`, color: '#F59E0B', limit: 'Alarm threshold: >600', pct: (sensorData.gas_ppm/1000)*100 },
                            { name: 'Product acidity (pH)', val: sensorData.ph, color: '#EF4444', limit: 'Rotting threshold: <5.0', pct: (sensorData.ph/14)*100 }
                          ].map((g, idx) => (
                            <Grid item xs={12} sm={6} md={3} key={idx}>
                              <Box sx={{ bgcolor: '#071028', p: 2, borderRadius: 3, border: '1px solid rgba(255,255,255,0.03)' }}>
                                <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary' }}>{g.name}</Typography>
                                <Typography variant="h4" fontWeight="bold" sx={{ color: g.color, mt: 1 }}>{g.val}</Typography>
                                <LinearProgress variant="determinate" value={g.pct} sx={{ height: 6, borderRadius: 3, mt: 1.5, mb: 1, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: g.color } }} />
                                <Typography sx={{ fontSize: 9, color: 'text.secondary' }}>{g.limit}</Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                </Grid>

                {/* Right Side: Floating AI Decision engines & Live Ops Stream (4/12 grid) */}
                <Grid item xs={12} lg={4} container spacing={3}>
                  
                  {/* Floating AI Autonomous Feed (Item 5) */}
                  <Grid item xs={12}>
                    <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981', animation: 'pulse 1.5s infinite' }} />
                          <Typography variant="h6" fontWeight="bold">AI Autonomous Action Stream</Typography>
                        </Box>

                        <Box display="flex" flexDirection="column" gap={2} sx={{ maxHeight: 420, overflowY: 'auto', pr: 0.5 }}>
                          {recommendations.map(rec => (
                            <Fade in key={rec.id}>
                              <Box sx={{ 
                                bgcolor: '#071028', 
                                borderLeft: `4px solid ${rec.status === 'replenished' ? '#F59E0B' : '#10B981'}`, 
                                p: 2, 
                                borderRadius: 2,
                                borderTop: '1px solid rgba(255,255,255,0.03)',
                                borderRight: '1px solid rgba(255,255,255,0.03)',
                                borderBottom: '1px solid rgba(255,255,255,0.03)'
                              }}>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                  <Chip label={rec.model} size="small" sx={{ height: 16, fontSize: 8, bgcolor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)' }} />
                                  <Typography sx={{ fontSize: 9, fontWeight: 900, color: '#10B981' }}>CONF: {rec.confidence}%</Typography>
                                </Box>
                                <Typography sx={{ fontSize: 11, color: '#EF4444', fontWeight: 800 }}>TRIGGER: {rec.trigger}</Typography>
                                <Typography sx={{ fontSize: 12, fontWeight: 800, mt: 0.5, color: '#fff' }}>ACTION: {rec.action}</Typography>
                                <Typography sx={{ fontSize: 10, color: '#10B981', fontWeight: 700, mt: 0.5 }}>IMPACT: {rec.impact}</Typography>
                                <Box display="flex" alignItems="center" gap={0.5} sx={{ mt: 1.5, pt: 1, borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                                  <CheckCircle sx={{ fontSize: 12, color: '#10B981' }} />
                                  <Typography sx={{ fontSize: 9, color: '#10B981', fontWeight: 800 }}>AUTO-APPLIED SUCCESSFULLY</Typography>
                                </Box>
                              </Box>
                            </Fade>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* AI Explainability & Pricing Optimization Panel (Item 14) */}
                  <Grid item xs={12}>
                    <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                          <BrainIcon sx={{ color: '#8B5CF6' }} />
                          <Typography variant="h6" fontWeight="bold">AI Decision Explainability (SHAP)</Typography>
                        </Box>

                        <Box display="flex" flexDirection="column" gap={2}>
                          {[
                            { name: 'Fresh Salad Cups', action: 'Promoted to clearance shelf', why: 'Tomatoes & Lettuce promoted because: Overstock (34%), Expiry Risk (High), Demand Forecast (Low)', savings: '₹4,500 expected saving', conf: '94%' },
                            { name: 'Greek Organic Yogurt', action: 'Discount increased to 22%', why: 'Yogurt flagged because: Expiry <48h, Temperature drift recorded (+2.4°C)', savings: '₹2,450 waste saved', conf: '96%' },
                            { name: 'Classic Blueberries Select', action: 'Direct coupon recommendation', why: 'Blueberry up-sell recommended because: Customer shopping cart contains Almond Milk (88% Correlation mined)', savings: '+12% Basket conversion', conf: '98%' }
                          ].map((item, idx) => (
                            <Box key={idx} sx={{ bgcolor: '#071028', p: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.03)' }}>
                              <Box display="flex" justifyContent="space-between" mb={0.5}>
                                <Typography sx={{ fontSize: 12, fontWeight: 900, color: '#8B5CF6' }}>{item.name}</Typography>
                                <Typography sx={{ fontSize: 9, fontWeight: 950, color: '#06B6D4' }}>{item.conf}</Typography>
                              </Box>
                              <Typography sx={{ fontSize: 10, fontWeight: 800, color: 'text.primary', mb: 1 }}>{item.action}</Typography>
                              <Typography sx={{ fontSize: 10, color: 'text.secondary', display: 'block', mb: 1 }}>
                                {item.why}
                              </Typography>
                              <Typography sx={{ fontSize: 10, color: '#10B981', fontWeight: 800 }}>
                                {item.savings}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Customer Intelligence Basket Correlation (Item 12) */}
                  <Grid item xs={12}>
                    <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                          <Timeline sx={{ color: '#06B6D4' }} />
                          <Typography variant="h6" fontWeight="bold">Customer Basket Intelligence</Typography>
                        </Box>

                        <Box sx={{ bgcolor: '#071028', p: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.03)' }}>
                          <Typography sx={{ fontSize: 11, fontWeight: 800, color: 'text.primary', mb: 1 }}>
                            🚀 Active Market Basket Correlations Mined:
                          </Typography>
                          <Box display="flex" flexDirection="column" gap={1.5} sx={{ mt: 1 }}>
                            {[
                              { items: 'Almond Milk → Blueberries', corr: '88% Correlation', type: 'High Conversion' },
                              { items: 'Beef Ribeye → Red Wine Vinegar', corr: '75% Correlation', type: 'Gourmet Dinner' },
                              { items: 'Greek Yogurt → Honey Organic', corr: '82% Correlation', type: 'Breakfast Deal' }
                            ].map((c, i) => (
                              <Box key={i} display="flex" justifyContent="space-between" alignItems="center" sx={{ bgcolor: 'rgba(255,255,255,0.01)', p: 1, borderRadius: 1.5, border: '1px solid rgba(255,255,255,0.02)' }}>
                                <Box>
                                  <Typography sx={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>{c.items}</Typography>
                                  <Typography sx={{ fontSize: 9, color: 'text.secondary' }}>{c.type}</Typography>
                                </Box>
                                <Chip label={c.corr} size="small" sx={{ bgcolor: 'rgba(6, 182, 212, 0.08)', color: '#06B6D4', fontWeight: 800, fontSize: 8, height: 16 }} />
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                </Grid>

              </Grid>
            )}

            {/* EXECUTIVE VIEW CONTENT (Item 17) */}
            {viewMode === 'Executive' && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="bold" mb={2}>Supermarket Sales Turnover Velocity (Weekly Target)</Typography>
                      <Box height={280}>
                        {analytics ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.turnoverByCategory}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                              <XAxis dataKey="category" stroke="rgba(255,255,255,0.4)" />
                              <YAxis stroke="rgba(255,255,255,0.4)" />
                              <RechartsTooltip />
                              <Bar dataKey="turnover" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : <CircularProgress />}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="bold" mb={2}>Algorithmic Pricing Yield Multipliers</Typography>
                      <Box height={280}>
                        {analytics ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.salesTrends}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                              <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" />
                              <YAxis stroke="rgba(255,255,255,0.4)" />
                              <RechartsTooltip />
                              <Area type="monotone" dataKey="predicted" stroke="#8B5CF6" fillOpacity={0.15} fill="#8B5CF6" name="Total Yield (₹)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        ) : <CircularProgress />}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="bold" mb={2}>Strategic Food Waste Diversion & Carbon Offset</Typography>
                      
                      <Grid container spacing={3}>
                        {[
                          { title: 'Total Spoilage Diverted', val: `${analytics?.wasteMetrics?.savedWeight_kg || '240'} kg`, desc: 'Biomass kept out of landfills', color: '#10B981' },
                          { title: 'Preserved Capital Value', val: `₹${analytics?.wasteMetrics?.totalSaved_INR?.toLocaleString() || '12,450'}`, desc: 'Direct financial salvage ROI', color: '#06B6D4' },
                          { title: 'Supplier Transit Buffer Saved', val: '4.8 Days', desc: 'Avg delivery lead efficiency', color: '#F59E0B' }
                        ].map((m, idx) => (
                          <Grid item xs={12} sm={4} key={idx}>
                            <Box sx={{ bgcolor: '#071028', p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.03)', textAlign: 'center' }}>
                              <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.secondary' }}>{m.title}</Typography>
                              <Typography variant="h3" fontWeight="900" sx={{ color: m.color, mt: 1.5, mb: 0.5 }}>{m.val}</Typography>
                              <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{m.desc}</Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

          </Box>
        )}

        {activeView === 'Inventory' && (
          <Box>
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3, display: 'flex', flexWrap: 'wrap', gap: 2, justifyItems: 'center', alignItems: 'center' }}>
                <TextField 
                  label="Search Inventory..." 
                  size="small" 
                  value={invSearch} 
                  onChange={e => { setInvSearch(e.target.value); setInvPage(1); }}
                  sx={{ flexGrow: 1, minWidth: 200 }}
                  InputProps={{
                    endAdornment: <SearchIcon color="action" />
                  }}
                />
                
                <TextField
                  select
                  label="Category"
                  size="small"
                  value={invCategory}
                  onChange={e => { setInvCategory(e.target.value); setInvPage(1); }}
                  sx={{ width: 160 }}
                >
                  {['All', 'Fruits', 'Vegetables', 'Dairy', 'Meat', 'Frozen Food', 'Drinks'].map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Sort By"
                  size="small"
                  value={invSortBy}
                  onChange={e => setInvSortBy(e.target.value)}
                  sx={{ width: 140 }}
                >
                  <MenuItem value="name">Product Name</MenuItem>
                  <MenuItem value="quantity">Stock level</MenuItem>
                  <MenuItem value="price">Base Price</MenuItem>
                  <MenuItem value="health_score">Health Score</MenuItem>
                  <MenuItem value="expiry_date">Expiry Date</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Order"
                  size="small"
                  value={invSortOrder}
                  onChange={e => setInvSortOrder(e.target.value)}
                  sx={{ width: 110 }}
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </TextField>

                <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setAddModalOpen(true)}>
                  Add Item
                </Button>
              </CardContent>
            </Card>

            {invLoading ? (
              <Box display="flex" justifyContent="center" py={12}><CircularProgress /></Box>
            ) : (
              <Grid container spacing={3}>
                {inventoryList.map(item => {
                  const img = CATEGORY_IMAGES[item.category] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300';
                  return (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                      <Card sx={{ height: '100%', position: 'relative', border: item.quantity < 20 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.05)' }}>
                        <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
                          <Chip 
                            label={item.quantity < 20 ? 'Low Stock' : item.health_score > 80 ? 'Fresh' : item.health_score > 50 ? 'Moderate' : 'Risky'} 
                            size="small" 
                            color={item.quantity < 20 ? 'error' : item.health_score > 80 ? 'success' : item.health_score > 50 ? 'warning' : 'error'}
                          />
                        </Box>

                        <Box sx={{ height: 140, overflow: 'hidden', position: 'relative', bgcolor: 'rgba(255,255,255,0.02)' }}>
                          <img src={img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                          <Box display="flex" alignItems="center" justifyContent="center" sx={{ position: 'absolute', inset: 0, fontSize: 44 }}>
                            {item.image_emoji}
                          </Box>
                        </Box>

                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="body2" color="text.secondary" fontWeight="bold" sx={{ fontSize: 10, textTransform: 'uppercase' }}>
                            {item.category}
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="bold" noWrap>
                            {item.name}
                          </Typography>
                          
                          <Box display="flex" gap={1} alignItems="center" mt={1}>
                            <Typography variant="h6" fontWeight="bold">₹{item.price}</Typography>
                            {item.discount > 0 && (
                              <Chip label={`${item.discount}% OFF`} size="small" color="error" variant="outlined" sx={{ height: 18, fontSize: 9 }} />
                            )}
                          </Box>

                          <Box sx={{ mt: 2 }}>
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="caption" color="text.secondary">Quantity Stock:</Typography>
                              <Typography variant="caption" fontWeight="bold" color="text.primary">{item.quantity} units</Typography>
                            </Box>
                            <Slider 
                              value={item.quantity} 
                              max={500} 
                              size="small"
                              onChange={(e, val) => {
                                const next = inventoryList.map(p => p.id === item.id ? { ...p, quantity: val } : p);
                                setInventoryList(next);
                              }}
                              onChangeCommitted={(e, val) => handleUpdateProduct(item.id, 'quantity', val)}
                              valueLabelDisplay="auto"
                            />
                          </Box>

                          <Box sx={{ mt: 1.5 }}>
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="caption" color="text.secondary">AI Health Score:</Typography>
                              <Typography variant="caption" fontWeight="bold" color={item.health_score > 70 ? 'success.main' : 'error.main'}>{item.health_score}/100</Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={item.health_score} 
                              color={item.health_score > 75 ? 'success' : item.health_score > 45 ? 'warning' : 'error'} 
                              sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                            />
                          </Box>

                          <Box display="flex" justifyContent="space-between" mt={1.5}>
                            <Typography variant="caption" color="text.secondary">Expiry: {item.expiry_date || 'N/A'}</Typography>
                            <Typography variant="caption" color="text.secondary">Supplier: {item.supplier}</Typography>
                          </Box>

                          <Divider sx={{ my: 1.5, opacity: 0.05 }} />

                          <Box display="flex" gap={1}>
                            <Button 
                              variant="outlined" 
                              size="small" 
                              color="primary" 
                              fullWidth 
                              startIcon={<HelpIcon />}
                              onClick={() => launchTraceabilityReport(item)}
                            >
                              XAI Audit
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="small" 
                              color="error" 
                              onClick={() => handleDeleteProduct(item.id)}
                            >
                              Del
                            </Button>
                          </Box>

                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}

            <Box display="flex" justifyContent="center" alignItems="center" gap={2} mt={4} mb={6}>
              <Button disabled={invPage === 1} variant="outlined" onClick={() => setInvPage(p => p - 1)}>
                Prev Page
              </Button>
              <Typography variant="body2">
                Page <strong>{invPage}</strong> of <strong>{Math.ceil(invTotal / 12) || 1}</strong> ({invTotal} total products)
              </Typography>
              <Button disabled={invPage * 12 >= invTotal} variant="outlined" onClick={() => setInvPage(p => p + 1)}>
                Next Page
              </Button>
            </Box>
          </Box>
        )}



        {activeView === 'AIDecisions' && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography variant="h6" fontWeight="bold">AI Superintendent - Automatically Executed Decisions Audit Log</Typography>
                      <Typography variant="caption" color="success.main" fontWeight="bold">✓ 100% Fully Automated</Typography>
                    </Box>
                    <Alert severity="success" sx={{ mb: 3 }}>
                      Every action listed here has been analyzed, calculated, and applied directly to the database state without needing manual approval.
                    </Alert>
                    <TableContainer component={Paper} sx={{ bgcolor: 'rgba(255,255,255,0.01)' }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Problem Trigger</TableCell>
                            <TableCell>Executed Action</TableCell>
                            <TableCell>Model Engine</TableCell>
                            <TableCell>Confidence</TableCell>
                            <TableCell>Impact Description</TableCell>
                            <TableCell>Operational Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {recommendations.map(rec => (
                            <TableRow key={rec.id}>
                              <TableCell sx={{ fontWeight: 'bold' }}>{rec.product_name}</TableCell>
                              <TableCell sx={{ color: 'error.light' }}>{rec.trigger}</TableCell>
                              <TableCell>{rec.action}</TableCell>
                              <TableCell><Chip label={rec.model} size="small" variant="outlined" color="primary" /></TableCell>
                              <TableCell>{rec.confidence}%</TableCell>
                              <TableCell sx={{ color: 'success.main' }}>{rec.impact}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={rec.status === 'replenished' ? '✓ Auto-Replenished' : '✓ Auto-Applied'} 
                                  color="success" 
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                          {recommendations.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={7} align="center">Awaiting autonomous background events...</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeView === 'ProductExpiry' && (
          <Box>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" mb={3}>Perishable Expiry Roadmap Timeline</Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Products expiring in under 3 days are automatically queried to push as smart coupons during kiosk checkout.
                </Alert>
                <Grid container spacing={3}>
                  {inventoryList.filter(p => p.expiry_date).slice(0, 12).map(p => {
                    const days = Math.max(-5, Math.ceil((new Date(p.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)));
                    return (
                      <Grid item xs={12} md={4} key={p.id}>
                        <Card sx={{ 
                          bgcolor: days <= 1 ? 'rgba(239, 68, 68, 0.05)' : days <= 3 ? 'rgba(245, 158, 11, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                          border: `1px solid ${days <= 1 ? '#ef4444' : days <= 3 ? '#f59e0b' : '#10b981'}`
                        }}>
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                              <Typography variant="subtitle1" fontWeight="bold">{p.name}</Typography>
                              <Typography variant="body2">{p.image_emoji}</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">Quantity on Shelf: {p.quantity} units</Typography>
                            <Typography variant="body2" color="text.secondary">Supplier: {p.supplier}</Typography>
                            
                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                              <Chip 
                                label={days < 0 ? `Expired ${Math.abs(days)}d ago` : days === 0 ? 'Expires Today' : `${days} days left`} 
                                color={days <= 1 ? 'error' : days <= 3 ? 'warning' : 'success'}
                                size="small"
                              />
                              <Button variant="outlined" size="small" color="primary" onClick={() => launchTraceabilityReport(p)}>
                                Trace XAI
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}

        {activeView === 'Restocking' && (
          <Box sx={{ mb: 6 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>Restock Safety Settings</Typography>
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="body2" gutterBottom>Safety Stock Level (Units)</Typography>
                      <Slider value={restockSafety} min={10} max={100} onChange={(e, val) => setRestockSafety(val)} valueLabelDisplay="auto" />
                      <Typography variant="caption" color="text.secondary">Baseline buffer stock kept to prevent stockouts.</Typography>
                    </Box>

                    <Box sx={{ mt: 4 }}>
                      <Typography variant="body2" gutterBottom>Supplier Lead Time (Days)</Typography>
                      <Slider value={restockLeadTime} min={1} max={10} onChange={(e, val) => setRestockLeadTime(val)} valueLabelDisplay="auto" />
                      <Typography variant="caption" color="text.secondary">Time taken by suppliers from PO to delivery.</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>Under-Stock Reorder point calculation</Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                      Formula: <strong>ReorderPoint = (AvgDailySales &times; LeadTime) + SafetyStock</strong>
                    </Typography>
                    <TableContainer component={Paper} sx={{ bgcolor: 'rgba(255,255,255,0.01)' }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Current stock</TableCell>
                            <TableCell>Daily sales</TableCell>
                            <TableCell>Reorder Point</TableCell>
                            <TableCell>Action Required</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {inventoryList.slice(0, 6).map(p => {
                            const daily = randomIntFromId(p.id, 8, 30);
                            const rp = Math.round(daily * restockLeadTime + restockSafety);
                            const under = p.quantity < rp;
                            return (
                              <TableRow key={p.id}>
                                <TableCell fontWeight="bold">{p.name}</TableCell>
                                <TableCell>{p.quantity} units</TableCell>
                                <TableCell>{daily} units/day</TableCell>
                                <TableCell>{rp} units</TableCell>
                                <TableCell>
                                  {under ? (
                                    <Chip label="Auto-PO Issued" color="error" size="small" />
                                  ) : (
                                    <Chip label="Stock Adequate" color="success" size="small" variant="outlined" />
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeView === 'SensorMonitor' && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">Sensor Temperature</Typography>
                    <Typography variant="h2" fontWeight="bold" sx={{ mt: 2, mb: 1, color: '#7c3aed' }}>{sensorData.temperature}°C</Typography>
                    <LinearProgress variant="determinate" value={(sensorData.temperature / 15) * 100} sx={{ height: 10, borderRadius: 5, mb: 2 }} color="primary" />
                    <Chip label="Optimal range 2-6°C" size="small" />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">Store Humidity</Typography>
                    <Typography variant="h2" fontWeight="bold" sx={{ mt: 2, mb: 1, color: '#10b981' }}>{sensorData.humidity}%</Typography>
                    <LinearProgress variant="determinate" value={sensorData.humidity} sx={{ height: 10, borderRadius: 5, mb: 2 }} color="secondary" />
                    <Chip label="Optimal range 55-65%" size="small" />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">Gas Concentration</Typography>
                    <Typography variant="h2" fontWeight="bold" sx={{ mt: 2, mb: 1, color: '#f59e0b' }}>{sensorData.gas_ppm} ppm</Typography>
                    <LinearProgress variant="determinate" value={(sensorData.gas_ppm / 1000) * 100} sx={{ height: 10, borderRadius: 5, mb: 2 }} color="warning" />
                    <Chip label="Rotting trigger: >600" size="small" />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">Active pH Quality</Typography>
                    <Typography variant="h2" fontWeight="bold" sx={{ mt: 2, mb: 1, color: '#ef4444' }}>{sensorData.ph}</Typography>
                    <LinearProgress variant="determinate" value={(sensorData.ph / 14) * 100} sx={{ height: 10, borderRadius: 5, mb: 2 }} color="error" />
                    <Chip label="Spoilage bounds: <5.0" size="small" />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {false && (
          <Box>
            {/* ─── NEW MACHINE LEARNING & AI SYSTEMS BREAKDOWN SECTION ─── */}
            <Card sx={{ mb: 4, background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(16, 185, 129, 0.05))', border: '1px solid rgba(255,255,255,0.05)' }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <BrainIcon color="primary" sx={{ fontSize: 32 }} />
                  <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: '-0.5px' }}>
                    QWIC Artificial Intelligence Model Breakdown
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  The Smart AI Supermarket OS employs <strong>5 distinct machine learning and algorithmic optimization models</strong> operating concurrently to fully automate store operations, dynamic pricing, and stock replenishment.
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6} lg={4}>
                    <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', height: '100%' }}>
                      <CardContent>
                        <Box display="flex" gap={1.5} alignItems="center" mb={1}>
                          <HardwareIcon color="secondary" />
                          <Typography variant="subtitle2" fontWeight="bold">1. Spoilage Random Forest</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          <strong>Where:</strong> Refrigerator Telemetry & Spoilage Classifier.<br />
                          <strong>How:</strong> Continuously fits real-time sensor parameters ($T, H$, Gas, $pH$) against a pre-compiled multi-class decision boundary sequence.<br />
                          <strong>Why:</strong> Incredible noise-immunity on analog drift signals and lightweight footprint, enabling it to run as a **TinyML** edge model on local ESP32 chips.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6} lg={4}>
                    <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', height: '100%' }}>
                      <CardContent>
                        <Box display="flex" gap={1.5} alignItems="center" mb={1}>
                          <AttachMoney color="primary" />
                          <Typography variant="subtitle2" fontWeight="bold">2. Explainable Linear Price Optimizer</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          <strong>Where:</strong> Shelf Dynamic Discount Allocation.<br />
                          <strong>How:</strong> Applies mathematical linear regression factor weights:<br />
                          <i>0.40(Expiry) + 0.25(Stock) + 0.20(Spoilage) + 0.10(Demand) + 0.05(Velocity)</i><br />
                          <strong>Why:</strong> Total transparency (XAI). Enables detailed SHAP feature attribution reports for full financial traceability audits.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6} lg={4}>
                    <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', height: '100%' }}>
                      <CardContent>
                        <Box display="flex" gap={1.5} alignItems="center" mb={1}>
                          <RestockIcon color="warning" />
                          <Typography variant="subtitle2" fontWeight="bold">3. Safety Reorder Optimizer</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          <strong>Where:</strong> Automated Shelf Replenishment (PO Generator).<br />
                          <strong>How:</strong> Safety buffer mathematics:<br />
                          <i>ReorderPoint = (AvgDailySales × LeadTime) + SafetyStock</i><br />
                          <strong>Why:</strong> Autonomously places replenishment orders to supplier pipelines the instant stock drops, keeping shelf occupancy high.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6} lg={4}>
                    <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', height: '100%' }}>
                      <CardContent>
                        <Box display="flex" gap={1.5} alignItems="center" mb={1}>
                          <HubIcon color="success" />
                          <Typography variant="subtitle2" fontWeight="bold">4. FP-Growth Coupon Mined Engine</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          <strong>Where:</strong> Customer Checkout Upsells & Deals Kiosk.<br />
                          <strong>How:</strong> Leverages itemset trees mined through the FP-Growth algorithm to output association lift factors (greater than 1.5).<br />
                          <strong>Why:</strong> Outstanding scalability, running sub-millisecond mining over massive transaction databases to find high-probability matches.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6} lg={4}>
                    <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', height: '100%' }}>
                      <CardContent>
                        <Box display="flex" gap={1.5} alignItems="center" mb={1}>
                          <LayersIcon color="error" />
                          <Typography variant="subtitle2" fontWeight="bold">5. Selection Ranker Engine</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          <strong>Where:</strong> High-Priority Shelf Alerts feed.<br />
                          <strong>How:</strong> Normalizes and compiles compound profit margins, overstock volumes, and supplier transit delay risks into priority lists.<br />
                          <strong>Why:</strong> Maximizes store focus on critical catalog batches and reduces administrative clutter.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {mlPredictions ? (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="bold" mb={2}>Random Forest Feature Importance (%)</Typography>
                      <Box height={260}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={mlPredictions.feature_importance} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis type="number" stroke="rgba(255,255,255,0.4)" />
                            <YAxis dataKey="feature" type="category" stroke="rgba(255,255,255,0.4)" width={150} />
                            <RechartsTooltip />
                            <Bar dataKey="importance" name="Shap importance contribution %" fill="#10b981" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="bold" mb={2}>Model Choice & Edge Performance</Typography>
                      <TableContainer component={Paper} sx={{ bgcolor: 'rgba(255,255,255,0.01)' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Classifier</TableCell>
                              <TableCell>Accuracy</TableCell>
                              <TableCell>Inference Latency</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell fontWeight="bold">Random Forest (Selected)</TableCell>
                              <TableCell>94.2%</TableCell>
                              <TableCell>1.2 ms</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>XGBoost</TableCell>
                              <TableCell>95.5%</TableCell>
                              <TableCell>4.8 ms</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Logistic Regression</TableCell>
                              <TableCell>81.0%</TableCell>
                              <TableCell>0.4 ms</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>TinyML (ESP32 Edge)</TableCell>
                              <TableCell>89.6%</TableCell>
                              <TableCell>0.8 ms</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                      
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" fontWeight="bold" color="primary.light">Why Random Forest was selected:</Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          - Handles extremely noisy sensor data spikes well without overfitting.<br />
                          - Generates fast sub-millisecond local explainable features automatically.<br />
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="bold" mb={2}>Latest Real-Time AI Predictions</Typography>
                      <TableContainer component={Paper} sx={{ bgcolor: 'rgba(255,255,255,0.01)' }}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Timestamp</TableCell>
                              <TableCell>Product</TableCell>
                              <TableCell>Prediction Status</TableCell>
                              <TableCell>Confidence Score</TableCell>
                              <TableCell>Algorithm Model</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {mlPredictions.recent_predictions.map(pred => (
                              <TableRow key={pred.id}>
                                <TableCell>{new Date(pred.timestamp).toLocaleTimeString()}</TableCell>
                                <TableCell fontWeight="bold">{pred.product_name}</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={pred.prediction} 
                                    color={pred.prediction === 'Fresh' ? 'success' : pred.prediction === 'Moderate' ? 'warning' : 'error'}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>{pred.confidence}%</TableCell>
                                <TableCell>{pred.model}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        )}

        {false && (
          <Box>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" mb={3}>System Architecture & Data Pipelines</Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary.light">1. IoT Edge Collectors</Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        MQ135 Gas sensors, DHT22 Temperature & Humidity, and Analog pH readers stream metrics continuously through local TinyML classifiers on ESP32 boards.
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary.light">2. FastAPI Super-Engine</Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        Handles REST payloads and computes explainable multi-factor scoring (Health, Spoilage risks, Discount ratios) using deterministic audit equations.
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary.light">3. SQLAlchemy & SQLite Core</Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        Persists all products, transaction logs, sensor data records, and AI decisions for complete database accountability.
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={2}>Active System REST APIs</Typography>
                  <Typography variant="caption" color="text.secondary" component="pre" sx={{ bgcolor: 'rgba(0,0,0,0.2)', p: 2, borderRadius: 2, display: 'block', overflowX: 'auto' }}>
                    {`GET  /api/products          - Fetch catalog with sorting, category filters, and pagination\n` +
                     `POST /api/products          - Insert new product catalog parameters\n` +
                     `PUT  /api/products/:id      - Update quantity level, pricing, and discount overrides\n` +
                     `POST /api/checkout          - Record POS transactions and automatically adjust inventory quantity\n` +
                     `GET  /api/sensor-data       - Stream live store gas readings, humidity, and pH stability\n` +
                     `POST /api/xai/traceability  - Calculate complete mathematical decision trace reports`}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {activeView === 'Settings' && (
          <Box>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" mb={3}>System Automation & Threshold Controls</Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={<Switch checked={autoApplyDiscount} onChange={e => setAutoApplyDiscount(e.target.checked)} />}
                      label="Auto-apply Near Expiry Discounts"
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4, mb: 3 }}>
                      If checked, the AI agent will automatically calculate and apply discount scores based on product health status.
                    </Typography>

                    <FormControlLabel
                      control={<Switch checked={autoOrderRestock} onChange={e => setAutoOrderRestock(e.target.checked)} />}
                      label="Auto-trigger Supplier Purchase Orders"
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4, mb: 3 }}>
                      If stock falls below safety points, automatically issue replenishment requests to registered suppliers.
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" gutterBottom>Max Acceptable Temp Limit (°C)</Typography>
                    <Slider value={tempThreshold} min={4.0} max={15.0} onChange={(e, val) => setTempThreshold(val)} valueLabelDisplay="auto" />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                      Temperature threshold before high spoilage alarms are triggered.
                    </Typography>

                    <TextField 
                      label="Default Supplier Contact" 
                      size="small" 
                      fullWidth 
                      defaultValue="orders@globalfoods.com" 
                      sx={{ mt: 2 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}

      </Box>

      {/* ─── EXPLAINABLE AI REPORT MODAL ─── */}
      <Dialog 
        open={traceModal.open} 
        onClose={() => setTraceModal({ open: false, data: null, loading: false })}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, bgcolor: '#1e293b', backgroundImage: 'none' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">🤖 Explainable AI (XAI) Decisive Report</Typography>
          <IconButton onClick={() => setTraceModal({ open: false, data: null, loading: false })} sx={{ color: 'text.secondary' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          {traceModal.loading ? (
            <Box display="flex" flexDirection="column" alignItems="center" py={6}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">Evaluating neural factors and running SHAP contributions...</Typography>
            </Box>
          ) : traceModal.data ? (
            <Box>
              <Typography variant="h5" color="primary.light" fontWeight="bold" gutterBottom>
                {traceModal.data.product_name}
              </Typography>
              
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">Action Decision: {traceModal.data.discount_decision.discount_pct}% Discount Applied</Typography>
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" gutterBottom>Deterministic Trace Factors</Typography>
                  <Box display="flex" flexDirection="column" gap={1.5}>
                    {traceModal.data.full_traceability_steps.map((step, i) => (
                      <Box key={i} display="flex" alignItems="center" gap={1.5}>
                        <CheckCircle color="success" sx={{ fontSize: 18 }} />
                        <Typography variant="body2">{step}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" gutterBottom>Model & Equation Audits</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 2 }}>
                    <Typography variant="body2" fontWeight="bold">Discount Formula:</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic', my: 0.5 }}>
                      {traceModal.data.discount_decision.formula}
                    </Typography>
                    <Divider sx={{ my: 1, opacity: 0.1 }} />
                    <Typography variant="body2" fontWeight="bold">Confidence Level:</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {traceModal.data.discount_decision.confidence}% ({traceModal.data.discount_decision.model})
                    </Typography>
                    <Divider sx={{ my: 1, opacity: 0.1 }} />
                    <Typography variant="body2" fontWeight="bold">Expected Business Impact:</Typography>
                    <Typography variant="caption" color="success.main" fontWeight="bold">
                      {traceModal.data.discount_decision.expected_business_impact.description}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" mb={2}>SHAP Factor Contribution Values</Typography>
                <Grid container spacing={2}>
                  {traceModal.data.discount_decision.factor_contributions.map((c, idx) => (
                    <Grid item xs={6} sm={2.4} key={idx}>
                      <Box sx={{ p: 1.5, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Typography variant="caption" color="text.secondary" display="block">{c.factor}</Typography>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: c.contribution_pts > 10 ? 'error.light' : 'text.primary' }}>
                          +{c.contribution_pts}%
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: 9 }} color="text.secondary">Share: {c.share_pct}%</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTraceModal({ open: false, data: null, loading: false })} color="inherit">
            Close Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── ADD NEW PRODUCT MODAL ─── */}
      <Dialog 
        open={addModalOpen} 
        onClose={() => setAddModalOpen(false)}
        PaperProps={{
          sx: { borderRadius: 4, bgcolor: '#1e293b' }
        }}
      >
        <form onSubmit={handleAddProduct}>
          <DialogTitle>Add New Shelf Product</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2, width: 340 }}>
            <TextField 
              label="Product Name" 
              required 
              size="small" 
              value={newProduct.name} 
              onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} 
            />
            <TextField 
              select 
              label="Category" 
              size="small" 
              value={newProduct.category} 
              onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
            >
              {['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Frozen Food', 'Drinks'].map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>
            <TextField 
              label="Price (INR)" 
              required 
              type="number" 
              size="small" 
              value={newProduct.price} 
              onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} 
            />
            <TextField 
              label="Shelf Quantity" 
              required 
              type="number" 
              size="small" 
              value={newProduct.quantity} 
              onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })} 
            />
            <TextField 
              label="Expiry Date" 
              type="date" 
              size="small" 
              InputLabelProps={{ shrink: true }}
              value={newProduct.expiry_date} 
              onChange={e => setNewProduct({ ...newProduct, expiry_date: e.target.value })} 
            />
            <TextField 
              label="Supplier Company" 
              size="small" 
              value={newProduct.supplier} 
              onChange={e => setNewProduct({ ...newProduct, supplier: e.target.value })} 
            />
            <TextField 
              label="Image Emoji icon" 
              size="small" 
              value={newProduct.image_emoji} 
              onChange={e => setNewProduct({ ...newProduct, image_emoji: e.target.value })} 
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddModalOpen(false)} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">Insert Product</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleToastClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleToastClose} severity={toast.severity} sx={{ width: '100%', borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          }
        `}
      </style>
    </Box>
  );
}
