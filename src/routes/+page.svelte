<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input";
    import { Textarea } from "$lib/components/ui/textarea";
    import { toast } from "svelte-sonner";
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import {PUBLIC_APP_ENVIRONMENT} from '$env/static/public'

    const webscocket= PUBLIC_APP_ENVIRONMENT =="dev"?
     `ws://${$page.url.host.replaceAll(":5173",":4000").replaceAll(":5173",":4000")}`:
     `ws://${$page.url.host.replaceAll(":5757",":4040").replaceAll(":3000",":4040")}`


    let subject=""
    let product=""
    let body=""
    let emails=""
    let selectedFiles: FileList | null = null;

    let isSending = false
    let isConnected=false

    async function fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // function handleFileUpload(event: Event) {
    //     console.log("adding attachments")
    //     const target = event.target as HTMLInputElement;
    //     if (target && target.files) {
    //         attachment = target.files[0]; // Get the selected file
    //     }
    // }

    let socket:WebSocket
    onMount(() => {
        socket = new WebSocket(webscocket); // Adjust the path if needed

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

    async function sendForm(){
        const attachments = [];
        if (selectedFiles) {
            for (const file of Array.from(selectedFiles)) {
                const base64 = await fileToBase64(file);
                attachments.push({
                    name: file.name,
                    data: base64.split(',')[1], // Remove the data URL prefix
                    content_type: file.type
                });
            }
        }

        isSending=true        
        let data={product,emails:emails.split("\n"),attachments}
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
                    <label for="product" class="text-sm font-medium text-gray-700">Product</label>
                    <Input bind:value={product} type="text" id="product" name="product" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <!-- <div class="flex flex-col">
                    <label for="email-body" class="text-sm font-medium text-gray-700">Email Body</label>
                    <Textarea bind:value={body} id="email-body" name="email-body" rows=3 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></Textarea>
                </div> -->
                <div class="flex flex-col">
                    <label for="attachment" class="text-sm font-medium text-gray-700">Attachment</label>
                    <input bind:files={selectedFiles} type="file" id="attachment" name="attachment" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
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
