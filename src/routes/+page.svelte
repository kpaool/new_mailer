<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input";
    import { Textarea } from "$lib/components/ui/textarea";
    import { toast } from "svelte-sonner";
    import { onMount } from 'svelte';

    let subject=""
    let body=""
    let emails=""
    let attachment: File | null = null;

    let isSending = false
    let isConnected=false

    function handleFileUpload(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target && target.files) {
            attachment = target.files[0]; // Get the selected file
        }
    }

    let socket:WebSocket
    onMount(() => {
        socket = new WebSocket('ws://localhost:4000'); // Adjust the path if needed

        socket.onopen = () => {
            console.log('Connected to WebSocket server');
            isConnected=true
            toast.success("Connected to the server")
        };

        socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if(message.message=="Completed all emails"){
            subject=""
            body=""
            emails=""
            isSending=false
        }
        toast.success(message.message)
        };

        socket.onclose = () => {
            isConnected=false
            console.log('WebSocket connection closed');
        };

        // Clean up WebSocket connection on component unmount
        return () => {
            socket.close();
        };
    });

    function sendMessage() {
        socket.send(JSON.stringify({ message: 'Hello from client!' }));
    }

    function sendForm(){
        isSending=true        
        let data={subject,body,emails:emails.split("\n"),attachment}
        socket.send(JSON.stringify(data));
        // isSending=false
        return
    }
</script>


<div class="flex flex-col justify-center items-center h-screen w-full p-8">
    <Card.Root class="md:w-96 bg-gray-50 my-8">
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
                    <Input on:change={handleFileUpload} type="file" id="attachment" name="attachment" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div class="flex flex-col">
                    <label for="emails" class="text-sm font-medium text-gray-700">Emails</label>
                    <Textarea bind:value={emails} id="emails" name="emails"  rows=3 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></Textarea>
                </div>
                <div class="flex justify-end">
                    <Button on:click={sendForm} disabled={isSending&&isConnected}>{isSending? 'Sending':isConnected?'Send':'Refresh page'}</Button>
                </div>
            </form>
        </Card.Content>
        <Card.Footer>
          <!-- <p>Card Footer</p> -->
        </Card.Footer>
    </Card.Root>

</div>
