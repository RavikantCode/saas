
import { clerkClient, clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/', '/sign-in', '/sign-up', '/api/webhook/register'])

export default clerkMiddleware(async(auth,request)=>{

  const { userId, redirectToSignIn } = await auth()

   if(!isPublicRoute(request)){
     return NextResponse.redirect(new URL('/sign-in',request.url))
   } 

   if(userId){
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId); //getting user
        const role = user.publicMetadata.role as String | undefined //getting user role

        //admin role redierction
        if(role === 'admin' && request.nextUrl.pathname ==='/dashboard'){
          return NextResponse.redirect(new URL('/admin/dashboard',request.url))

        }

        //prevent non-admin user oto acess admin routes
        if(role !=='admin' && request.nextUrl.pathname.startsWith('/admin')){
          return NextResponse.redirect(new URL('/dashbaord',request.url));
        }

        //redierct auth user trying to acess public route //checking also that public have access to go to the route 
        if(isPublicRoute(request)){
          return NextResponse.redirect(new URL(role === 'admin' ? 'admin/dashboard' : '/dashboard',request.url))
        }

      } catch (error) {
        console.error(error)
        return NextResponse.redirect(new URL('/error',request.url))
      }
   }
}) 

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}