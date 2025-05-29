import Subscriber from "../../models/subscriber-model.js"

export async function createSubscriber( email ) {
    try {
        await Subscriber.create({
            email: email
        })

        return true;
    } catch (error) {
        console.error("Error in userService.createUser ", error);
        throw error;
    }
}

