import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Grid, Card, CardContent, Typography, 
  Chip, Button, IconButton, Tabs, Tab, Snackbar, Alert, Badge,
  AppBar, Toolbar, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider,
  useTheme, useMediaQuery, Fade, CircularProgress, Tooltip, Avatar
} from '@mui/material';
import { 
  TrendingUp, Timeline, ReportProblem, Settings, Dashboard as DashboardIcon, 
  Inventory, BarChart, NotificationsActive, LocalDining, AttachMoney, 
  AccessTime, WarningAmber, CheckCircle, Close
} from '@mui/icons-material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, ReferenceArea
} from 'recharts';
import UserCheckout from './UserCheckout';

const drawerWidth = 240;

export default function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [kpi, setKpi] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [inventoryTab, setInventoryTab] = useState(0);
  const [activeView, setActiveView] = useState('Dashboard');

  // Fetch data
  useEffect(() => {
    // Simulating API call to backend (we have the server.js running locally ideally)
    // For standalone demo, we mock if fetch fails.
    const fetchData = async () => {
      try {
        const [kpiRes, recRes, invRes, salesRes] = await Promise.all([
          fetch('http://localhost:8000/api/kpi').then(res => res.json()).catch(() => null),
          fetch('http://localhost:8000/api/recommendations').then(res => res.json()).catch(() => null),
          fetch('http://localhost:8000/api/inventory').then(res => res.json()).catch(() => null),
          fetch('http://localhost:8000/api/sales').then(res => res.json()).catch(() => null),
        ]);

        if (kpiRes) setKpi(kpiRes);
        else setKpi({ liveRevenue: 15420, occupancyRate: 85, wasteRiskLevel: 'High' });

        if (recRes) setRecommendations(recRes);
        else setRecommendations([
          { id: 1, trigger: 'Mutton Curry sales are 40% below target', action: 'Create a 15% discount bundle with Cold Coffee', impact: '+₹1,200 revenue', status: 'pending' },
          { id: 2, trigger: 'Tomatoes expiring in <12 hours', action: 'Recommend Tomato Soup as "Chef\'s Special" today', impact: 'Save ₹400 in waste', status: 'pending' }
        ]);

        if (invRes) setInventory(invRes);
        else setInventory([
          { id: 1, name: 'Tomatoes', category: 'Groceries', status: 'Red', expiry: '< 12 hours', stock: '10 kg' },
          { id: 2, name: 'Milk', category: 'Beverages', status: 'Orange', expiry: '1 Day', stock: '20 Liters' },
          { id: 3, name: 'Chicken', category: 'Main Course', status: 'Green', expiry: '3 Days', stock: '50 kg' },
          { id: 4, name: 'Cold Coffee Beans', category: 'Beverages', status: 'Green', expiry: '1 Month', stock: '5 kg' },
          { id: 5, name: 'Mutton', category: 'Main Course', status: 'Orange', expiry: '2 Days', stock: '15 kg' },
        ]);

        if (salesRes) setSales(salesRes);
        else setSales([
          { time: '10:00', actual: 2000, predicted: 2200 },
          { time: '11:00', actual: 3500, predicted: 3000 },
          { time: '12:00', actual: 4000, predicted: 4500 },
          { time: '13:00', actual: 6000, predicted: 6500 },
          { time: '14:00', actual: 5500, predicted: 5000 },
          { time: '15:00', actual: 3000, predicted: 3500 },
        ]);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchData();
  }, []);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleAction = (id, actionType) => {
    // Simulating API Call
    setRecommendations(prev => prev.filter(r => r.id !== id));
    setToast({ 
      open: true, 
      message: actionType === 'approve' ? 'Successfully applied to menu!' : 'Recommendation dismissed.',
      severity: actionType === 'approve' ? 'success' : 'info'
    });
  };

  const handleToastClose = () => setToast({ ...toast, open: false });

  const drawer = (
    <div>
      <Toolbar sx={{ my: 2 }}>
        <LocalDining sx={{ color: theme.palette.primary.main, mr: 2, fontSize: 32 }} />
        <Typography variant="h6" noWrap component="div" fontWeight="bold">
          QWIC
        </Typography>
      </Toolbar>
      <List>
        {['Dashboard', 'Inventory', 'Sales Analytics', 'Settings', 'User Checkout Kiosk'].map((text, index) => (
          <ListItem 
            button 
            key={text} 
            onClick={() => setActiveView(text === 'User Checkout Kiosk' ? 'Checkout' : 'Dashboard')}
            sx={{ 
            borderRadius: 2, 
            mx: 1, 
            mb: 1,
            backgroundColor: (activeView === 'Dashboard' && index === 0) || (activeView === 'Checkout' && text === 'User Checkout Kiosk') ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
            color: (activeView === 'Dashboard' && index === 0) || (activeView === 'Checkout' && text === 'User Checkout Kiosk') ? theme.palette.primary.light : 'text.secondary'
          }}>
            <ListItemIcon sx={{ color: (activeView === 'Dashboard' && index === 0) || (activeView === 'Checkout' && text === 'User Checkout Kiosk') ? theme.palette.primary.light : 'inherit' }}>
              {index === 0 ? <DashboardIcon /> : index === 1 ? <Inventory /> : index === 2 ? <BarChart /> : index === 3 ? <Settings /> : <LocalDining />}
            </ListItemIcon>
            <ListItemText primary={text} primaryTypographyProps={{ fontWeight: index === 0 || text === 'User Checkout Kiosk' ? 600 : 400 }} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2, mt: 'auto', position: 'absolute', bottom: 0, width: '100%' }}>
        <Card sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', animation: 'pulse 1.5s infinite' }} />
              <Typography variant="caption" color="success.light" fontWeight="bold">
                AI Agent Active
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </div>
  );

  if (!kpi) return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><CircularProgress /></Box>;

  const filteredInventory = inventory.filter(item => {
    if (inventoryTab === 0) return item.category === 'Groceries';
    if (inventoryTab === 1) return item.category === 'Beverages';
    return item.category === 'Main Course';
  });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
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

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', mb: 4, borderRadius: 2 }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            {isMobile && (
              <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
                <DashboardIcon />
              </IconButton>
            )}
            <Box>
              <Typography variant="h5" fontWeight="700">{activeView === 'Checkout' ? 'Self-Service Checkout' : 'Command Center'}</Typography>
              <Typography variant="body2" color="text.secondary">{activeView === 'Checkout' ? 'Customer Point of View Simulator' : 'Live Pulse Check'}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Badge badgeContent={activeView === 'Checkout' ? 0 : recommendations.length} color="error" overlap="circular">
                <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: 'error.main' }}>
                  <NotificationsActive />
                </Avatar>
              </Badge>
            </Box>
          </Toolbar>
        </AppBar>

        {activeView === 'Checkout' ? (
          <UserCheckout />
        ) : (
        <Grid container spacing={3}>
          {/* Top Row: KPIs */}
          <Grid item xs={12} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(124, 58, 237, 0.05))' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="subtitle2">Live Revenue</Typography>
                    <Typography variant="h4" fontWeight="bold" mt={1}>₹{kpi.liveRevenue.toLocaleString()}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main' }}><AttachMoney /></Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="subtitle2">Occupancy Rate</Typography>
                    <Typography variant="h4" fontWeight="bold" mt={1}>{kpi.occupancyRate}%</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}><Timeline /></Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ background: kpi.wasteRiskLevel === 'High' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05))' : 'default' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="subtitle2">Waste Risk Level</Typography>
                    <Typography variant="h4" fontWeight="bold" mt={1} color={kpi.wasteRiskLevel === 'High' ? 'error.main' : 'inherit'}>
                      {kpi.wasteRiskLevel}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: kpi.wasteRiskLevel === 'High' ? 'error.main' : 'warning.main' }}><WarningAmber /></Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* AI Recommendation Feed & Urgent Badge */}
          <Grid item xs={12} lg={4}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.main', animation: 'pulse 1.5s infinite' }} />
              <Typography variant="h6" fontWeight="bold">AI Decisions</Typography>
            </Box>
            
            {recommendations.length > 0 && (
              <Alert icon={<ReportProblem fontSize="inherit" />} severity="error" sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}>
                <Typography variant="subtitle2" fontWeight="bold">Urgent Action Required</Typography>
                <Typography variant="caption">{recommendations.length} Items needing immediate approval.</Typography>
              </Alert>
            )}

            <Box display="flex" flexDirection="column" gap={2}>
              {recommendations.map(rec => (
                <Fade in key={rec.id}>
                  <Card sx={{ borderLeft: `4px solid ${theme.palette.primary.main}` }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          TRIGGER: {rec.trigger}
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight="600" mb={1}>
                        {rec.action}
                      </Typography>
                      <Typography variant="subtitle2" color="success.main" mb={2}>
                        {rec.impact}
                      </Typography>
                      <Box display="flex" gap={1}>
                        <Button variant="contained" color="primary" size="small" onClick={() => handleAction(rec.id, 'approve')} sx={{ flex: 1 }}>
                          Approve
                        </Button>
                        <Button variant="outlined" color="inherit" size="small" onClick={() => handleAction(rec.id, 'dismiss')} sx={{ flex: 1 }}>
                          Dismiss
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              ))}
              {recommendations.length === 0 && (
                <Box textAlign="center" py={4} bgcolor="rgba(255,255,255,0.02)" borderRadius={2}>
                  <CheckCircle sx={{ color: 'success.main', fontSize: 40, mb: 1, opacity: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">All AI recommendations handled.</Typography>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} lg={8} container spacing={3}>
            {/* Sales Prediction Chart */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" mb={2}>Sales Prediction vs Actual</Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sales} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                        <YAxis stroke="rgba(255,255,255,0.5)" />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }}
                        />
                        <Legend />
                        <ReferenceArea x1="12:00" x2="14:00" strokeOpacity={0.3} fill="rgba(16, 185, 129, 0.1)" />
                        <Line type="monotone" dataKey="actual" name="Actual Sales" stroke="#a78bfa" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="predicted" name="AI Predicted" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box mt={2} display="flex" justifyContent="center">
                    <Typography variant="caption" color="text.secondary">
                      * Shaded area represents peak time based on AI predictions.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Visual Inventory Map */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold">Visual Inventory & Expiry Map</Typography>
                  </Box>
                  <Tabs value={inventoryTab} onChange={(e, v) => setInventoryTab(v)} sx={{ mb: 2 }}>
                    <Tab label="Groceries" />
                    <Tab label="Beverages" />
                    <Tab label="Main Course" />
                  </Tabs>
                  <Grid container spacing={2}>
                    {filteredInventory.map(item => (
                      <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Card sx={{ 
                          bgcolor: item.status === 'Red' ? 'rgba(239, 68, 68, 0.1)' : 
                                   item.status === 'Orange' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          border: `1px solid ${
                            item.status === 'Red' ? 'rgba(239, 68, 68, 0.3)' : 
                            item.status === 'Orange' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'
                          }`
                        }}>
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Typography variant="subtitle1" fontWeight="bold">{item.name}</Typography>
                            <Box display="flex" justifyContent="space-between" mt={1}>
                              <Typography variant="caption" color="text.secondary">Stock: {item.stock}</Typography>
                              <Chip 
                                label={item.expiry} 
                                size="small" 
                                color={item.status === 'Red' ? 'error' : item.status === 'Orange' ? 'warning' : 'success'}
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
        )}
      </Box>
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
