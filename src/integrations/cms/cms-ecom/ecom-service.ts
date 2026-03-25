export interface BuyNowItem {
  collectionId: string;
  itemId: string;
  quantity: number;
}

export async function buyNow(items: BuyNowItem[]): Promise<void> {
  try {
    // In production, this would redirect to Wix checkout
    // For now, just log the action
    console.log('Buy now initiated with items:', items);
    
    // Simulate checkout redirect
    await new Promise(resolve => setTimeout(resolve, 500));
    window.location.href = '/checkout';
  } catch (error) {
    console.error('Buy now failed:', error);
    throw error;
  }
}
