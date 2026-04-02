export async function shareLocation(title: string, text: string, url: string) {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
      return false;
    }
  } else {
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      alert('Link copied to clipboard!');
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }
}
