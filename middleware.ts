import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define the route to be public/ignored by authentication checks
const isPublicCallbackStratergy = createRouteMatcher(['/api/oauth/google/callback(.*)']);

export default clerkMiddleware(async (auth, req) => {
    // If it's the callback, do nothing and let it pass
    if (isPublicCallbackStratergy(req)) {
        return;
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
