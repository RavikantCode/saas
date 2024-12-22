import {PrismaClient} from '@prisma/client'

const PrimsaClientSingleton=()=>{
    return new PrismaClient()
}

const globalForPrisma = global as  unknown as {prisma: PrismaClient | undefined}

const prisma = globalForPrisma.prisma ?? PrimsaClientSingleton();

export default prisma;

if(process.env.NODE_ENV !== 'production'){
    globalForPrisma.prisma = prisma;   
}

 