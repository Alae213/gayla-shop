export function Footer() {
  return (
    <footer className="border-t py-8 mt-auto">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold mb-4">Gayla Shop</h3>
            <p className="text-sm text-muted-foreground">
              Your trusted online store in Algeria
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/products" className="text-muted-foreground hover:text-primary">
                  Products
                </a>
              </li>
              <li>
                <a href="/track-order" className="text-muted-foreground hover:text-primary">
                  Track Order
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Contact</h3>
            <p className="text-sm text-muted-foreground">
              Email: contact@gaylashop.com
              <br />
              Phone: +213 XXX XXX XXX
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © 2026 Gayla Shop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
