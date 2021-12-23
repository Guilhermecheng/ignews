# ignews
<br>

<img src="https://user-images.githubusercontent.com/62719629/147183023-c5d19af4-e7ff-4db0-a14b-dff613a9936f.png" height="400px" />

<br>
Ignews is a web platform for front-end development related news and posts<br>
It was used as a study case of a NEXT.js platform, using as base for its services faunaDB, Stripe and Prismic CMS.

<br>

## The Project

### Home page
<img src="https://user-images.githubusercontent.com/62719629/147183023-c5d19af4-e7ff-4db0-a14b-dff613a9936f.png" height="300px"/>
 Main page, where user can make login, and subscribe

<br>  

### Posts page
<img src="https://user-images.githubusercontent.com/62719629/147183452-5df4b02d-8c5e-4029-9690-1d9cd20be711.png" height="300px" />
Where user can see all posts made, and click each to open and read more.

### Post
<div>
<img src="https://user-images.githubusercontent.com/62719629/147184304-fbd2647f-68b7-49b3-9e88-84c2b8dfe1f3.png" height="300px" />
<img src="https://user-images.githubusercontent.com/62719629/147184565-34e1d162-b30a-4584-bb77-3d116b95d0dd.png" height="300px" />
</div>
If user is logged and has subscribed to ignews, he can read each post fully. If not logged, or doesn't have subscribed, user can only read the first few paragraphs, to get an introduction of the post.

## Functionalities

- user can sign in/ sign up with github
- user can subscribe to ignews
- user can read posts

### Login
User can login through Github auth:
<div>
<img src="https://user-images.githubusercontent.com/62719629/147184705-50717386-a81c-434f-9f15-59505e8e2cfc.png" height="50px" />
<img src="https://user-images.githubusercontent.com/62719629/147185188-b17e3d7a-7ea0-4748-aa29-139c0f9557ed.png" height="50px" />
</div>


Github's auth is in [nextauth].ts:
```javascript
providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
          params: {
              scope: 'read:user',
          },
      },
    }),
  ],
```

### Subscription
Once logged, user can subscribe to ignews. Stripe is used as payment method.<br>
Stripe's API is used to redirect customer to checkout, and once it's done, customer can access all posts.
<br>

**Stripe's checkout:**

<img src="https://user-images.githubusercontent.com/62719629/147186187-61796541-52ac-496f-ae1b-4d79289e5d16.png" height="500px" />

<br>
Stripe's checkout at subscribe.ts (along with some faunaDB queries for validation of data):<br>

```javascript

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if(req.method === 'POST') {
        const session  = await getSession({ req })

        const user = await fauna.query<User>(
            q.Get(
                q.Match(
                    q.Index('user_by_email'),
                    q.Casefold(session.user.email)
                )
            )
        )

        let customerId = user.data.stripe_customer_id;
        if(!customerId) {

            const stripeCustomer = await stripe.customers.create({
                email: session.user.email,
            })
    
            await fauna.query(
                q.Update(
                    q.Ref(
                        q.Collection('users'), user.ref.id
                    ), {
                        data: {
                            stripe_customer_id: stripeCustomer.id,
                        }
                    }
                )
            )

            customerId = stripeCustomer.id;
        }


        const stripecheckoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            billing_address_collection: 'required',
            line_items: [
                { price: 'price_1K6NFAGo1kJoOfXkEF4tw0BL', quantity: 1 }
            ],
            mode: 'subscription',
            allow_promotion_codes: true,
            success_url: process.env.STRIPE_SUCCESS_URL,
            cancel_url: process.env.STRIPE_CANCEL_URL
        })

        return res.status(200).json({ sessionId: stripecheckoutSession.id })
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method not allowed');
    }
}
```

**To be continued**
