import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, Button, Grid, IconButton, 
  Divider, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Slide, Fade 
} from '@mui/material';
import { 
  ShoppingCart, Add, Remove, Delete, LocalOffer, AutoAwesome
} from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

import { MENU_ITEMS } from './data/products';

export default function UserCheckout() {
  const [cart, setCart] = useState([]);
  const [showOffer, setShowOffer] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Poll the Node.js backend to see if the IoT Raspberry Pi camera detected an item
  // and the Cloud ML Engine generated a coupon for it.
  useEffect(() => {
    let interval;
    if (isCameraActive) {
      interval = setInterval(async () => {
        try {
          const response = await fetch('/api/iot/latest_offer');
          const data = await response.json();
          if (data.new_offer && data.offer) {
            console.log("Cloud IoT Offer Received!", data.offer);
            setCurrentOffer(data.offer);
            setShowOffer(true);
          }
        } catch (error) {
          console.error("IoT Polling Error:", error);
        }
      }, 3000); // Poll every 3 seconds
    }
    return () => clearInterval(interval);
  }, [isCameraActive]);

  const handleAddToCart = async (item) => {
    // Optimistic UI update
    const newCart = [...cart];
    const existing = newCart.find(i => i.id === item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      newCart.push({ ...item, qty: 1 });
    }
    setCart([...newCart]);

    // Send the current cart to the backend ML Engine for real-time recommendations
    try {
      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: 'kiosk-01', cart: newCart.map(i => i.name) })
      });
      
      const data = await response.json();
      
      if (data.ai_response && data.ai_response.recommendation) {
        const recommendedItemName = data.ai_response.recommendation;
        const offerItemObj = MENU_ITEMS.find(i => i.name === recommendedItemName);
        
        if (offerItemObj) {
          // Calculate the discount price based on the text (e.g. 30% OFF)
          const discountMatch = data.ai_response.discountText.match(/(\d+)%/);
          const percentOff = discountMatch ? parseInt(discountMatch[1]) : 15;
          const discountPrice = Math.floor(offerItemObj.price * (1 - (percentOff / 100)));

          setCurrentOffer({
            triggerItem: item.name,
            offerItem: offerItemObj,
            discountText: data.ai_response.discountText,
            discountPrice: discountPrice,
            message: data.ai_response.message,
            aiType: `Cloud Market Basket Analysis (Lift: ${data.ai_response.lift})`
          });
          setTimeout(() => setShowOffer(true), 800);
        }
      }
    } catch (error) {
      console.error("Failed to fetch ML recommendation:", error);
    }
  };

  const handleUpdateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const handleRemove = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const acceptOffer = () => {
    if (currentOffer.offerItem) {
      setCart(prev => [...prev, { ...currentOffer.offerItem, price: currentOffer.discountPrice, qty: 1, isOffer: true }]);
    } else {
      // Modify existing item price (e.g. Tomato Soup)
      setCart(prev => prev.map(i => i.name === currentOffer.triggerItem ? { ...i, price: currentOffer.discountPrice, isOffer: true } : i));
    }
    setShowOffer(false);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <Box sx={{ p: 4, height: '100%', bgcolor: 'background.default' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h4" fontWeight="bold">Smart Checkout Kiosk</Typography>
        <Button 
          variant={isCameraActive ? "contained" : "outlined"} 
          color={isCameraActive ? "success" : "primary"}
          onClick={() => setIsCameraActive(!isCameraActive)}
          sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 'bold' }}
        >
          {isCameraActive ? "IoT Camera Sync: ON" : "IoT Camera Sync: OFF"}
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" mb={4}>Experience the AI from the customer's point of view.</Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h6" mb={2}>Menu</Typography>
          <Grid container spacing={2}>
            {MENU_ITEMS.map(item => (
              <Grid item xs={12} sm={6} key={item.id}>
                <Card sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6">{item.name}</Typography>
                      <Typography color="text.secondary" variant="body2">{item.category}</Typography>
                      <Typography color="primary.main" fontWeight="bold" mt={1}>₹{item.price}</Typography>
                    </Box>
                    <IconButton color="primary" onClick={() => handleAddToCart(item)} sx={{ bgcolor: 'rgba(124, 58, 237, 0.1)' }}>
                      <Add />
                    </IconButton>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.1)' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <ShoppingCart />
                <Typography variant="h6">Your Cart</Typography>
              </Box>

              {cart.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" mt={4}>Cart is empty</Typography>
              ) : (
                <Box display="flex" flexDirection="column" gap={2}>
                  {cart.map(item => (
                    <Box key={item.id} display="flex" justifyContent="space-between" alignItems="center">
                      <Box flex={1}>
                        <Typography variant="body1" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                          {item.name} 
                          {item.isOffer && <Chip size="small" icon={<LocalOffer fontSize="small"/>} label="Offer" color="secondary" sx={{ height: 20, fontSize: '10px' }}/>}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">₹{item.price} x {item.qty}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconButton size="small" onClick={() => handleUpdateQty(item.id, -1)} disabled={item.qty <= 1}><Remove fontSize="small" /></IconButton>
                        <Typography>{item.qty}</Typography>
                        <IconButton size="small" onClick={() => handleUpdateQty(item.id, 1)}><Add fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleRemove(item.id)}><Delete fontSize="small" /></IconButton>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <Box p={3}>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main">₹{cartTotal}</Typography>
              </Box>
              <Button variant="contained" color="primary" fullWidth size="large" disabled={cart.length === 0}>
                Checkout Now
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* AI Dynamic Offer Dialog */}
      <Dialog 
        open={showOffer} 
        TransitionComponent={Transition} 
        keepMounted 
        onClose={() => setShowOffer(false)}
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02))', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 4 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.light' }}>
          <AutoAwesome /> Smart Offer Unlocked!
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" mb={2}>{currentOffer?.message}</Typography>
          {currentOffer?.offerItem && (
            <Card sx={{ bgcolor: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
              <Box>
                <Typography fontWeight="bold">{currentOffer.offerItem.name}</Typography>
                <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary', mr: 1 }}>₹{currentOffer.offerItem.price}</Typography>
                <Typography variant="body2" color="secondary.main" display="inline">₹{currentOffer.discountPrice}</Typography>
              </Box>
              <Chip label={currentOffer.discountText} color="secondary" />
            </Card>
          )}
          {!currentOffer?.offerItem && (
             <Chip label={currentOffer?.discountText} color="secondary" sx={{ mt: 1 }} />
          )}
          <Box mt={3} p={1.5} bgcolor="rgba(255,255,255,0.05)" borderRadius={2}>
            <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
              AI Logic Triggered: {currentOffer?.aiType}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setShowOffer(false)} color="inherit">No Thanks</Button>
          <Button onClick={acceptOffer} variant="contained" color="secondary" sx={{ color: '#000', fontWeight: 'bold' }}>
            Accept Offer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
