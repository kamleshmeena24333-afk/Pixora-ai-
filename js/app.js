// Pixora AI Global State Manager
const Pixora = {
  credits: parseInt(localStorage.getItem('pixora_credits')) || 1200,
  user: JSON.parse(localStorage.getItem('pixora_user')) || {
    name: 'Alex Rivers',
    email: 'alex@example.com',
    plan: 'Pro Plan'
  },
  
  deductCredit(amount = 5) {
    if (this.credits >= amount) {
      this.credits -= amount;
      localStorage.setItem('pixora_credits', this.credits);
      this.updateCreditBadges();
      return true;
    } else {
      alert("Insufficient credits! Please upgrade your plan.");
      return false;
    }
  },

  updateCreditBadges() {
    const badges = document.querySelectorAll('.credit-count');
    badges.forEach(el => el.innerText = this.credits);
  },

  init() {
    this.updateCreditBadges();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Pixora.init();
});
