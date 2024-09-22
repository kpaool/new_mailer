<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input";
    import { Textarea } from "$lib/components/ui/textarea";
    import { toast } from "svelte-sonner";

    let subject=""
    let body=""
    let emails=""
    let attachment:any

    let isSending = false
    function sendForm(){
        isSending=true

        fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ subject, body, emails, attachment })
        })
        .then(response => response.json())
        .then(data => {
            toast.success("Emails have been sent", {
                description: data.message,
                action: {
                    label: "Undo",
                    onClick: () => console.info("Undo")
                }
            })
            isSending=false
        })
        .catch(error =>{
            toast.error("Emails have not been sent", {
                description: error,
                action: {
                    label: "Undo",
                    onClick: () => console.info("Undo")
                }
            })
            isSending=false
        });
          
    }
</script>


<div class="flex flex-col justify-center items-center h-screen w-full p-8">
    <Card.Root class="md:w-96 bg-gray-50">
        <Card.Header>
          <Card.Title>Send emails</Card.Title>
          <Card.Description>Send bulk email</Card.Description>
        </Card.Header>
        <Card.Content>
            <form class="space-y-4">
                <div class="flex flex-col">
                    <label for="subject" class="text-sm font-medium text-gray-700">Subject</label>
                    <Input bind:value={subject} type="text" id="subject" name="subject" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div class="flex flex-col">
                    <label for="email-body" class="text-sm font-medium text-gray-700">Email Body</label>
                    <Textarea bind:value={body} id="email-body" name="email-body" rows=3 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></Textarea>
                </div>
                <div class="flex flex-col">
                    <label for="attachment" class="text-sm font-medium text-gray-700">Attachment</label>
                    <Input bind:value={attachment} type="file" id="attachment" name="attachment" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div class="flex flex-col">
                    <label for="emails" class="text-sm font-medium text-gray-700">Emails</label>
                    <Textarea bind:value={emails} id="emails" name="emails"  rows=3 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></Textarea>
                </div>
                <div class="flex justify-end">
                    <Button on:click={sendForm} disabled={isSending}>{isSending? 'Sending':'Send'}</Button>
                </div>
            </form>
        </Card.Content>
        <Card.Footer>
          <!-- <p>Card Footer</p> -->
        </Card.Footer>
    </Card.Root>

</div>
