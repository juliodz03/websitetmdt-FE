import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';
import CartSidebar from './CartSidebar';
import { Toaster } from 'react-hot-toast';

export default function Layout({ children, title = 'E-Commerce Store' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Modern e-commerce store" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>

      <CartSidebar />
      <Toaster position="top-right" />
    </>
  );
}
