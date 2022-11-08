import { getQuery } from "https://deno.land/x/oak@v11.1.0/helpers.ts";

import {
    Application,
    Router,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";

type User = {
    dni: string;
    nombre: string;
    apellidos: string;
    telefono: string;
    email: string;
    iban: string;
    id: string;
    transactions?: Transaction[]; //Tiene que haber una transacción dentro del tipo User
};

type Transaction = {
    id_sender: string;
    id_receiver: string;
    amount: number;
}

let users: User[] = [
    {
        dni: "52359865L",
        nombre: "María",
        apellidos: "Martín-Toledano García-Mauriño",
        telefono: "697845632",
        email: "maria.martol@gmail.com",
        iban: "ES576890982345607986345867",
        id: "1",
        transactions: []
    },
    {
        dni: "59836714M",
        nombre: "Elsa",
        apellidos: "García Cardeña",
        telefono: "715987264",
        email: "laura.gc@gmail.com",
        iban: "ES956872345201987463895693",
        id: "2",
        transactions: []
    },
    {
        dni: "73495861P",
        nombre: "Elsa",
        apellidos: "Gordillo Peñas",
        telefono: "698234615",
        email: "elsa.gorpe@gmail.com",
        iban: "ES934061740923846139844756",
        id: "3",
        transactions: []
    },
    {
        dni: "76975861P",
        nombre: "Elsa",
        apellidos: "García Díaz",
        telefono: "696902315",
        email: "elsa.gardz@gmail.com",
        iban: "ES9340617409475920475623456",
        id: "4",
        transactions: []
    },
];

const router = new Router();

router
    //Devuelve solamente un user en específico
    // localhost:4000/api/users?dni=73737373&nombre=pepe
    // localhost:4000/api/users?dni=73737373
    .get("/users", (context) => {
        const dni = context.request.url.searchParams.get("dni");
        const nombre = context.request.url.searchParams.get("nombre");
        const apellidos = context.request.url.searchParams.get("apellidos");
        const telefono = context.request.url.searchParams.get("telefono");
        const email = context.request.url.searchParams.get("email");
        const iban = context.request.url.searchParams.get("iban");
        const id = context.request.url.searchParams.get("id");

        //Para que se pueda buscar con cualquier parámetro:
        const user: User[] | undefined = users.filter(
            (user) => (!dni || user.dni === dni) && (!nombre || user.nombre === nombre) && (!apellidos || user.apellidos === apellidos) 
            && (!telefono || user.telefono === telefono)  && (!email || user.email === email)  && (!iban || user.iban === iban)
            && (!id || user.id === id)
        );

        if (user) {
            context.response.body = user;
            return;
        }

        context.response.status = 404;

    }).post("/users", async (context) => {
        const result = context.request.body({ type: "json" });
        const user: User = await result.value;

        console.log({ user })

        user.id = crypto.randomUUID(); //Para crear un id aleatorio y asegurarnos de que sea único.

        users.push(user);
        context.response.status = 200;
        context.response.body = user;

    }).delete("/users/:email", (context) => {
        if (
            context.params?.email &&
            users.find((user) => user.email === context.params.email)
        ) {
            users = users.filter((user) => user.email !== context.params.email); //nos quedamos con todos los usuarios que no tengan el id pedido y lo guardamos en "users"
            context.response.status = 200;
            return;
        }
        context.response.status = 404;

    /*Lo hemos hecho de tal forma que en la petición se ponga el id del user que está realizando la transacción, 
    y que el id del que la recibe se indique junto con la cantidad en la petición http:*/
    }).post("/users/:id/transactions", async (context) => {
        const id = context.params?.id;
        
        const user = users.find((user) => user.id === id);
        
        if (!user) {
            context.response.status = 404;
            return;
        }
        
        const result = context.request.body({ type: "json" });
        const transaction: Transaction = await result.value;
        transaction.id_sender = id;

        user.transactions?.push(transaction);
        context.response.body = user;
    })

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 7777 });